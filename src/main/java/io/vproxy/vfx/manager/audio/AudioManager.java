package io.vproxy.vfx.manager.audio;

import io.vproxy.base.util.LogType;
import io.vproxy.base.util.Logger;
import javafx.scene.media.AudioClip;

import java.io.IOException;
import java.util.Map;
import java.util.WeakHashMap;
import java.util.concurrent.ConcurrentHashMap;

public class AudioManager {
    private static final AudioManager instance = new AudioManager();

    public static AudioManager get() {
        return instance;
    }

    private AudioManager() {
    }

    private final Map<String, AudioClip> map = new ConcurrentHashMap<>();
    private final WeakHashMap<String, AudioClip> weakMap = new WeakHashMap<>();

    public AudioClip loadAudio(String path) {
        try {
            return loadAudio(path, false);
        } catch (Exception ignore) {
            return null;
        }
    }

    @SuppressWarnings("RedundantThrows")
    public AudioClip loadAudio(String path, boolean throwException) throws Exception {
        if (path.startsWith("/")) {
            path = path.substring(1);
        }
        var audio = map.get(path);
        if (audio == null) {
            audio = weakMap.get(path);
        }
        if (audio != null) {
            assert Logger.lowLevelDebug("using cached audio: " + path);
            return audio;
        }
        try {
            var res = getClass().getClassLoader().getResource(path);
            if (res == null) {
                Logger.error(LogType.FILE_ERROR, "unable to find resource for audio " + path);
                if (throwException) {
                    throw new IOException("cannot find audio " + path);
                }
                return null;
            }
            audio = new AudioClip(res.toExternalForm());
        } catch (Exception e) {
            Logger.error(LogType.FILE_ERROR, "failed loading audio " + path, e);
            if (throwException) {
                throw e;
            }
            return null;
        }
        map.put(path, audio);
        assert Logger.lowLevelDebug("new audio loaded: " + path);
        return audio;
    }

    public AudioClip weakRefAudio(String path) {
        var audio = map.remove(path);
        if (audio == null) {
            return null;
        }
        weakMap.put(path, audio);
        return audio;
    }

    public void removeAudio(String path) {
        if (!map.containsKey(path) && !weakMap.containsKey(path)) {
            return;
        }
        map.remove(path);
        weakMap.remove(path);
        assert Logger.lowLevelDebug("audio removed: " + path);
    }
}
