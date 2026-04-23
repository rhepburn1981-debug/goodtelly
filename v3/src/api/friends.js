import { api } from './client'

export function getFriends() {
  return api.get('/api/friends')
}

export function getFriendRequests() {
  return api.get('/api/friends/requests')
}

export function sendFriendRequest(username) {
  return api.post('/api/friends/' + username)
}

export function acceptFriendRequest(username) {
  return api.put('/api/friends/' + username + '/accept')
}

export function removeFriend(username) {
  return api.delete('/api/friends/' + username)
}

export function connectFriend(username) {
  // Auto-connect from invite link (no approval needed)
  return api.post('/api/friends/' + username + '/connect')
}

export function getFriendFilms(username) {
  return api.get('/api/friends/' + username + '/films')
}

export function getFriendsRatings() {
  return api.get('/api/me/friends-ratings')
}

export function findUsers(query) {
  return api.get('/api/users/find?q=' + encodeURIComponent(query))
}

export function getUserProfile(username) {
  return api.get('/api/users/' + username)
}

export function logFriendView(username) {
  return api.post('/api/log/friend_view', { username }).catch(() => {})
}
