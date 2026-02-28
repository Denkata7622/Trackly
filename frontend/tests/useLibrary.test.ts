import { renderHook, act } from "@testing-library/react";
import { useLibrary } from "../features/library/useLibrary";
import * as libraryApi from "../features/library/api";

// Mock the API calls
jest.mock("../features/library/api");

describe("useLibrary Hook - Playlist Functionality", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should initialize with empty playlists", () => {
    const { result } = renderHook(() => useLibrary("profile-1"));

    expect(result.current.playlists).toEqual([]);
  });

  it("should create a playlist locally", async () => {
    const { result } = renderHook(() => useLibrary("profile-1"));

    let createdPlaylist;
    await act(async () => {
      createdPlaylist = await result.current.createPlaylist("My Playlist");
    });

    expect(createdPlaylist).toBeDefined();
    expect(createdPlaylist?.name).toBe("My Playlist");
    expect(createdPlaylist?.songs).toHaveLength(0);
    expect(result.current.playlists).toHaveLength(1);
  });

  it("should add a song to a playlist", async () => {
    const { result } = renderHook(() => useLibrary("profile-1"));

    let playlistId: string;
    await act(async () => {
      const playlist = await result.current.createPlaylist("Test Playlist");
      playlistId = playlist!.id;
    });

    const song = { title: "Test Song", artist: "Test Artist", album: "Test Album" };

    await act(async () => {
      await result.current.addSongToPlaylist(playlistId!, song);
    });

    const updatedPlaylist = result.current.playlists.find((p) => p.id === playlistId);
    expect(updatedPlaylist!.songs).toContainEqual(expect.objectContaining(song));
  });

  it("should remove a song from a playlist", async () => {
    const { result } = renderHook(() => useLibrary("profile-1"));

    const song = { title: "Remove Me", artist: "Test Artist" };
    let playlistId: string;

    await act(async () => {
      const playlist = await result.current.createPlaylist("Remove Test");
      playlistId = playlist!.id;
      await result.current.addSongToPlaylist(playlistId, song);
    });

    await act(async () => {
      await result.current.removeSongFromPlaylist(playlistId!, "Remove Me", "Test Artist");
    });

    const updatedPlaylist = result.current.playlists.find((p) => p.id === playlistId);
    expect(updatedPlaylist!.songs).toHaveLength(0);
  });

  it("should delete a playlist", async () => {
    const { result } = renderHook(() => useLibrary("profile-1"));

    let playlistId: string;
    await act(async () => {
      const playlist = await result.current.createPlaylist("Delete Test");
      playlistId = playlist!.id;
    });

    expect(result.current.playlists).toHaveLength(1);

    await act(async () => {
      await result.current.deletePlaylist(playlistId!);
    });

    expect(result.current.playlists).toHaveLength(0);
  });

  it("should prevent duplicate songs in a playlist", async () => {
    const { result } = renderHook(() => useLibrary("profile-1"));

    const song = { title: "Duplicate", artist: "Artist" };
    let playlistId: string;

    await act(async () => {
      const playlist = await result.current.createPlaylist("Dup Test");
      playlistId = playlist!.id;
      await result.current.addSongToPlaylist(playlistId, song);
      await result.current.addSongToPlaylist(playlistId, song);
    });

    const updatedPlaylist = result.current.playlists.find((p) => p.id === playlistId);
    expect(updatedPlaylist!.songs.filter((s) => s.title === "Duplicate")).toHaveLength(1);
  });

  it("should manage multiple playlists independently", async () => {
    const { result } = renderHook(() => useLibrary("profile-1"));

    let playlist1Id: string;
    let playlist2Id: string;

    await act(async () => {
      const p1 = await result.current.createPlaylist("Playlist 1");
      const p2 = await result.current.createPlaylist("Playlist 2");
      playlist1Id = p1!.id;
      playlist2Id = p2!.id;

      const song1 = { title: "Song 1", artist: "Artist A" };
      const song2 = { title: "Song 2", artist: "Artist B" };

      await result.current.addSongToPlaylist(playlist1Id, song1);
      await result.current.addSongToPlaylist(playlist2Id, song2);
    });

    const pl1 = result.current.playlists.find((p) => p.id === playlist1Id);
    const pl2 = result.current.playlists.find((p) => p.id === playlist2Id);

    expect(pl1!.songs).toHaveLength(1);
    expect(pl1!.songs[0].title).toBe("Song 1");
    expect(pl2!.songs).toHaveLength(1);
    expect(pl2!.songs[0].title).toBe("Song 2");
  });

  it("should preserve favorites separately from playlists", async () => {
    const { result } = renderHook(() => useLibrary("profile-1"));

    await act(async () => {
      result.current.toggleFavorite("song-1");
      result.current.toggleFavorite("song-2");
    });

    await act(async () => {
      await result.current.createPlaylist("Playlist");
    });

    expect(result.current.favoritesSet).toHaveLength(2);
    expect(result.current.playlists).toHaveLength(1);
    expect(result.current.favoritesSet.has("song-1")).toBe(true);
    expect(result.current.favoritesSet.has("song-2")).toBe(true);
  });
});
