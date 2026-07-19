import type { Page } from '@playwright/test'
import type {
  SubProps,
  VideoData,
  WatchedVideos,
  ChannelSearchResult,
} from '../../src/lib/types'

interface StubFirebaseAuthOptions {
  userId?: string
  youtubeApiKey?: string
  subs?: Record<string, SubProps>
  watchedVideos?: WatchedVideos
  // Leaves `subs` out of the initial onSnapshot payload so tests can observe
  // the app while it's authenticated but still waiting on subs to load.
  // Use window.__triggerSnapshotUpdate to deliver subs afterwards.
  omitSubsFromInitialSnapshot?: boolean
}

/**
 * Sets up Firebase stubs for authenticated tests
 */
export async function stubFirebaseAuth(
  page: Page,
  options: StubFirebaseAuthOptions = {},
) {
  const {
    userId = 'test-user-123',
    youtubeApiKey = 'fake-api-key',
    subs = {
      'channel-1': {
        id: 'channel-1',
        title: 'Test Channel',
        thumb: 'https://example.com/thumb.jpg',
        playlistId: 'UU123',
        type: 'channel',
        order: 0,
      },
    },
    watchedVideos = {},
    omitSubsFromInitialSnapshot = false,
  } = options

  // Set up Firebase stubs before the app loads
  await page.addInitScript(
    ({
      userId,
      youtubeApiKey,
      subs,
      watchedVideos,
      omitSubsFromInitialSnapshot,
    }) => {
      let snapshotCallback: (snapshot: {
        exists: boolean
        data: () => unknown
      }) => void

      // Lets tests simulate a remote change to the user doc (e.g. another
      // client editing subs) arriving over the real-time listener, independent
      // of any local action.
      window.__triggerSnapshotUpdate = (data: unknown) => {
        snapshotCallback({
          exists: true,
          data: () => data,
        })
      }

      window.__firebaseStubs = {
        currentUser: { uid: userId } as never,

        onAuthStateChanged: (callback) => {
          // Immediately call with mock user
          setTimeout(() => callback({ uid: userId } as never), 0)
          // Return unsubscribe function
          return () => {}
        },

        signIn: () => Promise.resolve({ user: { uid: userId } }),

        signOut: () => Promise.resolve(),

        userDoc: () => ({
          get: () =>
            Promise.resolve({
              exists: true,
              data: () => ({ youtubeApiKey, subs, watchedVideos }),
            }),
          onSnapshot: (
            callback: (snapshot: {
              exists: boolean
              data: () => unknown
            }) => void,
          ) => {
            snapshotCallback = callback

            setTimeout(() => {
              callback({
                exists: true,
                data: () => ({
                  youtubeApiKey,
                  subs: omitSubsFromInitialSnapshot ? undefined : subs,
                  watchedVideos,
                }),
              })
            }, 0)
            return () => {}
          },
          set: () => Promise.resolve(),
          update: () => Promise.resolve(),
        }),

        deleteField: () => Promise.resolve(),
      }
    },
    { userId, youtubeApiKey, subs, watchedVideos, omitSubsFromInitialSnapshot },
  )
}

/**
 * Intercepts the YouTube iframe API script with a fake implementation so
 * tests can drive player events (ready, state changes) deterministically
 * instead of depending on a real embedded video. Fake players are tracked on
 * `window.__ytPlayers`, in creation order, with recorded method calls.
 */
export async function mockYoutubeIframeApi(page: Page) {
  await page.route('https://www.youtube.com/iframe_api', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        window.__ytPlayers = window.__ytPlayers || [];

        window.YT = {
          PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2 },
          Player: function (elementId, config) {
            const player = {
              elementId: elementId,
              config: config,
              state: null,
              currentTime: 0,
              calls: { stopVideo: 0, loadVideoById: [], setSize: [], destroy: 0 },
              getCurrentTime: function () { return player.currentTime },
              getPlayerState: function () { return player.state },
              stopVideo: function () { player.calls.stopVideo++ },
              loadVideoById: function (opts) { player.calls.loadVideoById.push(opts) },
              setSize: function (width, height) { player.calls.setSize.push([width, height]) },
              destroy: function () { player.calls.destroy++ },
              simulateReady: function () { config.events.onReady() },
              simulateStateChange: function (state) {
                player.state = state
                config.events.onStateChange({ data: state })
              },
            }

            window.__ytPlayers.push(player)

            return player
          },
        }

        if (typeof window.onYouTubeIframeAPIReady === 'function') window.onYouTubeIframeAPIReady()
      `,
    })
  })
}

interface SearchPlaylistOption {
  id?: string
  title?: string
  description?: string
  published?: string
  thumb?: string
  count?: number
}

interface ChannelApiItem {
  id?: string
  contentDetails: { relatedPlaylists: { uploads: string } }
  snippet?: { thumbnails: { medium: { url: string } } }
}

interface PaginationPage {
  videos: VideoData[]
  prevPageToken?: string
  nextPageToken?: string
}

interface SetupAppOptions {
  userId?: string
  youtubeApiKey?: string
  subs?: Record<string, SubProps>
  videos?: VideoData[]
  search?: ChannelSearchResult[]
  playlists?: SearchPlaylistOption[]
  channels?: ChannelApiItem[]
  watchedVideos?: WatchedVideos
  pagination?: Record<string, PaginationPage>
  playlistsNextPageToken?: string
  nextPageToken?: string
}

/**
 * Setup both Firebase auth and YouTube API mocking together
 */
export async function setupApp(page: Page, options: SetupAppOptions = {}) {
  const {
    userId = 'test-user-123',
    youtubeApiKey = 'fake-api-key',
    subs = {},
    videos = [],
    search = [],
    playlists = [],
    channels = [],
    watchedVideos = {},
  } = options

  // Set up Firebase stubs
  await stubFirebaseAuth(page, { userId, youtubeApiKey, subs, watchedVideos })

  // Convert videos array to a lookup for easy access
  const videosById: Record<string, VideoData> = {}
  videos.forEach((v) => {
    videosById[v.id] = v
  })

  // Mock YouTube API requests
  await page.route(
    'https://www.googleapis.com/youtube/v3/**',
    async (route, request) => {
      const url = request.url()

      if (url.includes('/search')) {
        const searchParams = new URL(url).searchParams
        const channelId = searchParams.get('channelId')

        if (channelId) {
          // Searching for videos within a channel
          const query = (searchParams.get('q') || '').toLowerCase()
          const matchingVideos = videos.filter(
            (video) =>
              video.channelId === channelId &&
              video.title.toLowerCase().includes(query),
          )

          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              items: matchingVideos.map((video) => ({
                id: { videoId: video.id },
              })),
            }),
          })
        } else {
          // Searching for channels to add as a subscription
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              items: search.map((channel) => ({
                id: { channelId: channel.id },
                snippet: {
                  channelTitle:
                    (channel as ChannelSearchResult & { channelTitle?: string })
                      .channelTitle ?? channel.title,
                  title: channel.title,
                  thumbnails: {
                    medium: {
                      url: channel.thumb || 'https://example.com/thumb.jpg',
                    },
                  },
                },
              })),
            }),
          })
        }
      } else if (url.includes('/channels')) {
        const channelData =
          channels.length > 0
            ? channels
            : [
                {
                  contentDetails: {
                    relatedPlaylists: { uploads: 'UU_uploads' },
                  },
                },
              ]
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: channelData }),
        })
      } else if (url.includes('/playlists')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: playlists.map((playlist) => ({
              id: playlist.id,
              snippet: {
                title: playlist.title,
                description: playlist.description || '',
                publishedAt: playlist.published || '2024-01-01T00:00:00Z',
                thumbnails: {
                  medium: {
                    url:
                      playlist.thumb ||
                      'https://example.com/playlist-thumb.jpg',
                  },
                },
              },
              contentDetails: {
                itemCount: playlist.count || 0,
              },
            })),
            pageInfo: { totalResults: playlists.length },
            nextPageToken: options.playlistsNextPageToken,
          }),
        })
      } else if (url.includes('/playlistItems')) {
        // Extract page token from URL if present
        const urlParams = new URL(url).searchParams
        const pageToken = urlParams.get('pageToken')

        // Get videos based on page token
        let videosToReturn = videos
        let prevPageToken: string | undefined
        let nextPageToken: string | undefined

        if (options.pagination) {
          const pageData = options.pagination[pageToken || ''] ||
            options.pagination['default'] || {
              videos,
              prevPageToken: undefined,
              nextPageToken: undefined,
            }
          videosToReturn = pageData.videos
          prevPageToken = pageData.prevPageToken
          nextPageToken = pageData.nextPageToken
        } else if (options.nextPageToken) {
          nextPageToken = options.nextPageToken
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: videosToReturn.map((video) => ({
              contentDetails: { videoId: video.id },
              snippet: {
                title: video.title,
                description: video.description || '',
                publishedAt: video.published || '2024-01-01T00:00:00Z',
                thumbnails: {
                  medium: {
                    url: video.thumb || 'https://example.com/video-thumb.jpg',
                  },
                },
              },
            })),
            prevPageToken,
            nextPageToken,
          }),
        })
      } else if (url.includes('/videos')) {
        // Parse requested video IDs from URL
        const urlParams = new URL(url).searchParams
        const requestedIds = urlParams.get('id')?.split(',') || []

        // Return requested videos or all videos
        const videosToReturn =
          requestedIds.length > 0
            ? requestedIds
                .map((id) => videosById[id] || videos.find((v) => v.id === id))
                .filter((v): v is VideoData => Boolean(v))
            : videos

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: videosToReturn.map((video) => ({
              id: video.id,
              snippet: {
                title: video.title,
                description: video.description || '',
                publishedAt: video.published || '2024-01-01T00:00:00Z',
                thumbnails: {
                  medium: {
                    url: video.thumb || 'https://example.com/video-thumb.jpg',
                  },
                },
                channelId: video.channelId || 'channel-1',
              },
              contentDetails: {
                duration: video.duration || 'PT10M0S',
              },
            })),
          }),
        })
      } else if (url.includes('/activities')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [] }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [] }),
        })
      }
    },
  )
}

type SubOptions = Partial<Omit<SubProps, 'type'>>

/**
 * Create a channel subscription object
 */
export function createChannel(options: SubOptions = {}): SubProps {
  return {
    id: options.id || 'channel-1',
    originalTitle: options.title || 'Test Channel',
    title: options.title || 'Test Channel',
    thumb: options.thumb || 'https://example.com/channel-thumb.jpg',
    playlistId: options.playlistId || 'UU123',
    type: 'channel',
    order: options.order ?? 0,
    markedVideoId: options.markedVideoId || null,
    bookmarkedPageToken: options.bookmarkedPageToken || null,
  }
}

/**
 * Create a playlist subscription object
 */
export function createPlaylist(options: SubOptions = {}): SubProps {
  return {
    id: options.id || 'playlist-1',
    originalTitle: options.title || 'Test Playlist',
    title: options.title || 'Test Playlist',
    thumb: options.thumb || 'https://example.com/playlist-thumb.jpg',
    playlistId: options.playlistId || options.id || 'PL123',
    type: 'playlist',
    order: options.order ?? 0,
    markedVideoId: options.markedVideoId || null,
    bookmarkedPageToken: options.bookmarkedPageToken || null,
  }
}

/**
 * Create a custom playlist subscription object
 */
export function createCustomPlaylist(options: SubOptions = {}): SubProps {
  return {
    id: options.id || 'custom-0',
    title: options.title || 'Custom Playlist',
    playlistId: options.playlistId || 'playlist-0',
    type: 'custom',
    order: options.order ?? 0,
    icon: options.icon || {
      icon: 'star',
      foregroundColor: '#FFFFFF',
      backgroundColor: '#333333',
    },
    videos: options.videos || {},
    markedVideoId: options.markedVideoId || null,
    bookmarkedPageToken: options.bookmarkedPageToken || null,
  }
}

type VideoOptions = Partial<VideoData>

/**
 * Create a video object
 */
export function createVideo(options: VideoOptions = {}): VideoData {
  return {
    id: options.id || 'video-1',
    title: options.title || 'Test Video',
    description: options.description || 'Test video description',
    published: options.published || '2024-01-01T00:00:00Z',
    thumb: options.thumb || 'https://example.com/video-thumb.jpg',
    duration: options.duration || 'PT10M0S',
    channelId: options.channelId || 'channel-1',
  }
}

/**
 * Create a playlist item for search results
 */
export function createSearchPlaylist(
  options: SearchPlaylistOption = {},
): Omit<Required<SearchPlaylistOption>, 'published'> {
  return {
    id: options.id || 'playlist-1',
    title: options.title || 'Test Playlist',
    count: options.count || 10,
    thumb: options.thumb || 'https://example.com/playlist-thumb.jpg',
    description: options.description || '',
  }
}
