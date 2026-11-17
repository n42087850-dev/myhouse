import httpx
import pytest

from app.services.telegram import TelegramClient, TelegramError, split_text, strip_markdown


def test_split_text_respects_limit():
    text = "\n".join(["x" * 100] * 100)
    parts = split_text(text, 1000)
    assert all(len(p) <= 1001 for p in parts) and "".join(parts).count("x") == 10000


def test_strip_markdown():
    assert strip_markdown("*a* `b`") == "a b"


@pytest.mark.asyncio
async def test_markdown_error_falls_back_to_plain():
    calls = []

    def handler(req: httpx.Request):
        body = req.content.decode()
        calls.append(body)
        if "parse_mode" in body:
            return httpx.Response(400, text="Bad Request: can't parse entities")
        return httpx.Response(200, json={"ok": True})

    tg = TelegramClient("T", httpx.AsyncClient(transport=httpx.MockTransport(handler)))
    await tg.send_message("1", "*broken_")
    assert len(calls) == 2 and "parse_mode" not in calls[1]


@pytest.mark.asyncio
async def test_error_does_not_leak_token():
    def handler(req):
        raise httpx.ConnectError("boom", request=req)

    tg = TelegramClient("SECRET:TOKEN", httpx.AsyncClient(transport=httpx.MockTransport(handler)))
    with pytest.raises(TelegramError) as e:
        await tg.send_message("1", "hi")
    assert "SECRET" not in str(e.value)
