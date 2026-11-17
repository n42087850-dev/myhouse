"""Telegram Bot API bilan ishlash (async). Token faqat serverda turadi."""
import base64
import logging

import httpx

log = logging.getLogger("myhouse.telegram")
API = "https://api.telegram.org"
MAX_LEN = 3800  # Telegram limiti 4096; zaxira bilan


class TelegramError(Exception):
    pass


def split_text(text: str, max_len: int = MAX_LEN) -> list[str]:
    if len(text) <= max_len:
        return [text]
    out, cur = [], ""
    for line in text.split("\n"):
        if len(cur) + len(line) + 1 > max_len and cur:
            out.append(cur)
            cur = ""
        while len(line) > max_len:
            out.append(line[:max_len])
            line = line[max_len:]
        cur += line + "\n"
    if cur.strip():
        out.append(cur)
    return out


def strip_markdown(text: str) -> str:
    return text.replace("*", "").replace("`", "").replace("\\", "")


class TelegramClient:
    def __init__(self, token: str, client: httpx.AsyncClient | None = None):
        self._base = f"{API}/bot{token}"
        self._client = client or httpx.AsyncClient(timeout=10)

    async def aclose(self) -> None:
        await self._client.aclose()

    async def _post(self, method: str, **kwargs) -> httpx.Response:
        try:
            return await self._client.post(f"{self._base}/{method}", **kwargs)
        except httpx.HTTPError as e:
            # Xato matnida token chiqib ketmasligi uchun URL ni yozmaymiz
            raise TelegramError(f"network error: {type(e).__name__}") from None

    async def send_message(self, chat_id: str, text: str) -> None:
        for chunk in split_text(text):
            r = await self._post(
                "sendMessage", json={"chat_id": chat_id, "text": chunk, "parse_mode": "Markdown"}
            )
            if r.status_code == 400 and "parse entities" in r.text:
                # Mijoz kiritgan _ yoki * Markdownni buzgan: oddiy matn sifatida qayta yuboramiz
                r = await self._post(
                    "sendMessage", json={"chat_id": chat_id, "text": strip_markdown(chunk)}
                )
            if r.status_code != 200:
                log.error("sendMessage failed: %s %s", r.status_code, r.text[:200])
                raise TelegramError(f"sendMessage {r.status_code}")

    async def send_photo(self, chat_id: str, data_url: str, caption: str) -> None:
        header, b64 = data_url.split(",", 1)
        ext = "jpg" if "jpeg" in header or "jpg" in header else header.split("/")[1].split(";")[0]
        blob = base64.b64decode(b64, validate=True)
        r = await self._post(
            "sendPhoto",
            data={"chat_id": chat_id, "caption": strip_markdown(caption)},
            files={"photo": (f"room_3d_snapshot.{ext}", blob)},
        )
        if r.status_code != 200:
            log.warning("sendPhoto failed: %s %s", r.status_code, r.text[:200])
            raise TelegramError(f"sendPhoto {r.status_code}")
