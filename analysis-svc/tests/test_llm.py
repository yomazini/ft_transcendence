from app import llm


def test_paid_model_chain(monkeypatch):
    monkeypatch.setattr(llm.settings, "paid_api", True)
    monkeypatch.setattr(llm.settings, "openrouter_model", "deepseek/paid")
    monkeypatch.setattr(llm.settings, "openrouter_fallback_models", "google/fallback")

    assert llm._get_model_chain() == ["deepseek/paid", "google/fallback"]


def test_free_model_chain_has_no_paid_fallback(monkeypatch):
    monkeypatch.setattr(llm.settings, "paid_api", False)

    assert llm._get_model_chain() == ["openrouter/free"]
