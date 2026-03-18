"""Tests for RagKnowledgeBase."""
from src.core import RagKnowledgeBase
def test_init(): assert RagKnowledgeBase().get_stats()["ops"] == 0
def test_op(): c = RagKnowledgeBase(); c.process(x=1); assert c.get_stats()["ops"] == 1
def test_multi(): c = RagKnowledgeBase(); [c.process() for _ in range(5)]; assert c.get_stats()["ops"] == 5
def test_reset(): c = RagKnowledgeBase(); c.process(); c.reset(); assert c.get_stats()["ops"] == 0
def test_service_name(): c = RagKnowledgeBase(); r = c.process(); assert r["service"] == "rag-knowledge-base"
