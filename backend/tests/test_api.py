import pytest
import pytest_asyncio


@pytest.mark.asyncio
async def test_health(client):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_create_collection(client):
    resp = await client.post("/api/collections", json={"name": "test-coll", "description": "A test"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "test-coll"
    assert data["id"]


@pytest.mark.asyncio
async def test_list_collections(client):
    await client.post("/api/collections", json={"name": "coll1"})
    await client.post("/api/collections", json={"name": "coll2"})
    resp = await client.get("/api/collections")
    assert resp.status_code == 200
    assert len(resp.json()) >= 2


@pytest.mark.asyncio
async def test_get_collection(client):
    create = await client.post("/api/collections", json={"name": "get-test"})
    cid = create.json()["id"]
    resp = await client.get(f"/api/collections/{cid}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "get-test"


@pytest.mark.asyncio
async def test_update_collection(client):
    create = await client.post("/api/collections", json={"name": "upd-test"})
    cid = create.json()["id"]
    resp = await client.put(f"/api/collections/{cid}", json={"description": "Updated"})
    assert resp.status_code == 200
    assert resp.json()["description"] == "Updated"


@pytest.mark.asyncio
async def test_delete_collection(client):
    create = await client.post("/api/collections", json={"name": "del-test"})
    cid = create.json()["id"]
    resp = await client.delete(f"/api/collections/{cid}")
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_collection_not_found(client):
    resp = await client.get("/api/collections/nonexistent")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_duplicate_collection(client):
    await client.post("/api/collections", json={"name": "dup-test"})
    resp = await client.post("/api/collections", json={"name": "dup-test"})
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_settings(client):
    resp = await client.get("/api/settings")
    assert resp.status_code == 200
    data = resp.json()
    assert "chunk_size" in data
    assert "top_k" in data


@pytest.mark.asyncio
async def test_update_settings(client):
    resp = await client.put("/api/settings", json={"chunk_size": 1024})
    assert resp.status_code == 200
    assert resp.json()["chunk_size"] == 1024


@pytest.mark.asyncio
async def test_analytics(client):
    resp = await client.get("/api/analytics")
    assert resp.status_code == 200
    data = resp.json()
    assert "collections" in data
    assert "documents" in data


@pytest.mark.asyncio
async def test_list_conversations(client):
    resp = await client.get("/api/chat/conversations")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_upload_bad_file_type(client):
    create = await client.post("/api/collections", json={"name": "upload-test"})
    cid = create.json()["id"]
    resp = await client.post(
        "/api/documents",
        data={"collection_id": cid},
        files={"file": ("test.xyz", b"content", "application/octet-stream")},
    )
    assert resp.status_code == 400
