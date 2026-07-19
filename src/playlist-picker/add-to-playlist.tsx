import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useSubsContext } from '../subs/subs-context'
import { parseQueryString } from '../lib/util'

// this route and component exist so a bookmarklet can be used to add a video
// to a playlist directly from YouTube
export const AddToPlaylist = () => {
  const { customPlaylists, addVideoToPlaylist } = useSubsContext()
  const location = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const { playlistId, videoId } = parseQueryString(location.search)
    const playlist = customPlaylists.find((playlist) => {
      return playlist.id === playlistId
    })

    if (playlist) {
      addVideoToPlaylist(playlist, videoId!)
      navigate({ pathname: `/subs/${playlist.id}`, search: '' })
    } else {
      setError('Playlist not found')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  return (
    <div className="add-to-playlist">
      {!error && <p>Adding video to playlist...</p>}
      {!!error && (
        <>
          <p>Failed to add video to playlist:</p>
          <p>{error}</p>
        </>
      )}
    </div>
  )
}
