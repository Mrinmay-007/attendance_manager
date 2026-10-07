import threading
import time
from typing import Any, Callable


class TTLCache:
    """Tiny thread-safe in-process cache. FastAPI runs sync endpoints in a thread pool, so it needs a lock."""

    def __init__(self, default_ttl: float = 300.0, max_items: int = 512):
        self._data: dict[Any, tuple[float, Any]] = {}
        self._lock = threading.Lock()
        self._epoch = 0  # bumps on clear(), so a slow loader can't store data from before a write
        self._ttl = default_ttl
        self._max = max_items

    def get_or_set(self, key: Any, loader: Callable[[], Any], ttl: float | None = None) -> Any:
        now = time.monotonic()
        with self._lock:
            hit = self._data.get(key)
            if hit and hit[0] > now:
                return hit[1]
            epoch = self._epoch

        value = loader()  # runs outside the lock, so a slow query never blocks other requests

        with self._lock:
            if epoch == self._epoch:
                if len(self._data) >= self._max:
                    self._evict(now)
                lifetime = self._ttl if ttl is None else ttl
                self._data[key] = (time.monotonic() + lifetime, value)
        return value

    def _evict(self, now: float) -> None:
        for k in [k for k, (exp, _) in self._data.items() if exp <= now]:
            del self._data[k]
        if len(self._data) >= self._max:
            del self._data[min(self._data, key=lambda k: self._data[k][0])]

    def clear(self) -> None:
        with self._lock:
            self._epoch += 1
            self._data.clear()


reference_cache = TTLCache(default_ttl=300)  # 5 minutes