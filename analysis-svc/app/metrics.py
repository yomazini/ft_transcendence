from prometheus_client import Counter, Histogram

http_requests = Counter(
    "http_requests_total",
    "HTTP requests",
    ["method", "route", "status"],
)
http_duration = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration",
    ["method", "route"],
)
analysis_llm_requests = Counter(
    "analysis_llm_requests_total",
    "LLM calls by model and status",
    ["model", "status"],
)
analysis_llm_duration = Histogram(
    "analysis_llm_duration_seconds",
    "LLM call duration",
    ["model"],
)
analysis_jobs = Counter(
    "analysis_jobs_total",
    "Analysis jobs by result",
    ["result"],
)
