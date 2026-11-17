import base64

PHONE = "+998 90 123 45 67"
PNG = "data:image/png;base64," + base64.b64encode(b"\x89PNG fake").decode()


def order(**kw):
    body = {"kind": "zamer_order", "text": "📐 *ZAMER*\n👤 *Mijoz:* Ali", "phone": PHONE, "name": "Ali"}
    body.update(kw)
    return body


def test_health(client):
    assert client.get("/health").json()["status"] == "ok"


def test_calculate(client):
    r = client.post("/calculate", json={"rooms": [
        {"room_type": "bedroom", "style": "japandi", "length": 4, "width": 3, "height": 2.7, "openings": 3}
    ]})
    d = r.json()
    assert d["total_floor_area_sqm"] == 12.0
    assert d["total_wall_area_sqm"] == round(2 * 7 * 2.7 - 3, 2)
    assert d["total_estimated_cost_uzs"] == 12 * 800000
    assert d["materials_estimate"]["laminate_sqm"] == round(12 * 1.08, 2)


def test_calculate_rejects_bad_input(client):
    r = client.post("/calculate", json={"rooms": [{"room_type": "garage", "length": 1, "width": 1, "height": 1}]})
    assert r.status_code == 422
    r = client.post("/calculate", json={"rooms": [{"room_type": "bedroom", "length": -1, "width": 1, "height": 1}]})
    assert r.status_code == 422


def test_design_ok_and_validation(client):
    assert client.get("/design/bedroom/japandi").status_code == 200
    assert client.get("/design/bedroom/unknown").status_code == 422


def test_order_sends_to_main_chat(client, tg):
    r = client.post("/order", json=order())
    assert r.status_code == 200
    assert tg.messages == [("-100111", order()["text"])]


def test_order_crew_goes_to_crew_chat(client, tg):
    client.post("/order", json=order(kind="crew"))
    assert tg.messages[0][0] == "-100222"


def test_order_with_photo(client, tg):
    r = client.post("/order", json=order(kind="single_estimate", photo=PNG))
    assert r.status_code == 200 and len(tg.photos) == 1


def test_order_rejects_bad_phone_and_photo(client):
    assert client.post("/order", json=order(phone="123")).status_code == 422
    assert client.post("/order", json=order(photo="http://evil/x.png")).status_code == 422
    assert client.post("/order", json=order(kind="hack")).status_code == 422


def test_order_rate_limit(client):
    codes = [client.post("/order", json=order()).status_code for _ in range(7)]
    assert codes[:5] == [200] * 5 and codes[5:] == [429, 429]


def test_cors_blocks_unknown_origin(client):
    r = client.options("/order", headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"})
    assert "access-control-allow-origin" not in r.headers
