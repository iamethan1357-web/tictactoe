"use client";
import { useState, useEffect, useCallback } from "react";

interface Friend { id: string; username: string; displayName: string; avatar: string; wins: number; losses: number; draws: number; }
interface PendingRequest { id: string; username: string; displayName: string; avatar: string; friendshipId: string; }
interface FriendsListProps { onInvite: (username: string) => void; showToast: (msg: string) => void; }

export default function FriendsList({ onInvite, showToast }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [addUsername, setAddUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const fetchFriends = useCallback(async () => { try { const res = await fetch("/api/friends"); if (res.ok) { const data = await res.json(); setFriends(data.friends || []); setPendingRequests(data.pendingRequests || []); } } catch { /* ignore */ } setLoading(false); }, []);
  useEffect(() => { fetchFriends(); }, [fetchFriends]);

  const addFriend = async (e: React.FormEvent) => { e.preventDefault(); if (!addUsername.trim()) return; setAdding(true); try { const res = await fetch("/api/friends", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: addUsername.trim() }) }); const data = await res.json(); if (res.ok) { showToast(data.message || "Friend request sent!"); setAddUsername(""); } else { showToast(data.error || "Failed to add friend"); } } catch { showToast("Network error"); } setAdding(false); };
  const respondToRequest = async (friendshipId: string, action: string) => { try { const res = await fetch("/api/friends/respond", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ friendshipId, action }) }); const data = await res.json(); if (res.ok) { showToast(data.message || "Done!"); fetchFriends(); } } catch { showToast("Failed to respond"); } };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: "#2d3748" }}>👥 Friends</h2>
      <div className="neo-card mb-4"><h3 className="font-semibold mb-3 text-sm" style={{ color: "#718096" }}>ADD FRIEND BY USERNAME</h3><form onSubmit={addFriend} className="flex gap-2"><input type="text" className="neo-input flex-1" placeholder="Enter username..." value={addUsername} onChange={(e) => setAddUsername(e.target.value)} /><button type="submit" disabled={adding} className="neo-btn-accent px-4 py-2 rounded-xl text-sm">{adding ? "..." : "Add"}</button></form></div>
      {pendingRequests.length > 0 && (<div className="neo-card mb-4"><h3 className="font-semibold mb-3 text-sm" style={{ color: "#718096" }}>PENDING REQUESTS</h3><div className="space-y-2">{pendingRequests.map((req) => (<div key={req.friendshipId} className="neo-pressed p-3 rounded-xl flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-xl">{req.avatar}</span><div><p className="text-sm font-semibold" style={{ color: "#2d3748" }}>{req.displayName}</p><p className="text-xs" style={{ color: "#718096" }}>@{req.username}</p></div></div><div className="flex gap-2"><button onClick={() => respondToRequest(req.friendshipId, "accept")} className="neo-btn-accent text-xs px-3 py-1 rounded-lg">Accept</button><button onClick={() => respondToRequest(req.friendshipId, "reject")} className="neo-btn-danger text-xs px-3 py-1 rounded-lg">Decline</button></div></div>))}</div></div>)}
      <div className="neo-card"><h3 className="font-semibold mb-3 text-sm" style={{ color: "#718096" }}>YOUR FRIENDS</h3>{loading ? (<div className="text-center py-8"><div className="text-2xl animate-pulse">⏳</div></div>) : friends.length === 0 ? (<div className="text-center py-8"><div className="text-3xl mb-2">🙁</div><p className="text-sm" style={{ color: "#718096" }}>No friends yet. Add someone by username!</p></div>) : (<div className="space-y-2">{friends.map((friend) => (<div key={friend.id} className="neo-pressed p-3 rounded-xl flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-xl">{friend.avatar}</span><div><p className="text-sm font-semibold" style={{ color: "#2d3748" }}>{friend.displayName}</p><p className="text-xs" style={{ color: "#718096" }}>@{friend.username} • W:{friend.wins} L:{friend.losses} D:{friend.draws}</p></div></div><button onClick={() => onInvite(friend.username)} className="neo-btn-accent text-xs px-3 py-2 rounded-lg">⚔️ Play</button></div>))}</div>)}</div>
    </div>
  );
}
