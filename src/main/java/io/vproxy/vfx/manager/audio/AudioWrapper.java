package io.vproxy.vfx.manager.audio;

import io.vproxy.vfx.util.FXUtils;
import javafx.scene.media.AudioClip;

public class AudioWrapper {
    private final AudioClip clip;
    private int count = 0;
    private boolean lastPlayed = false;

    public AudioWrapper(AudioClip clip) {
        this.clip = clip;
    }

    public int getCount() {
        return count;
    }

    public void play() {
        FXUtils.runOnFX(() -> {
            ++count;
            clip.play();
        });
    }

    public boolean isLastPlayed() {
        return lastPlayed;
    }

    public void setLastPlayed(boolean lastPlayed) {
        this.lastPlayed = lastPlayed;
    }
}
