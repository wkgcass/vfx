package io.vproxy.vfx.manager.audio;

import io.vproxy.vfx.util.FXUtils;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedList;
import java.util.concurrent.ThreadLocalRandom;

public class AudioGroup {
    private static final Comparator<AudioWrapper> comparator = (a, b) -> {
        if (a.isLastPlayed()) return 1;
        if (b.isLastPlayed()) return -1;
        return a.getCount() - b.getCount();
    };
    private final LinkedList<AudioWrapper> queue = new LinkedList<>();

    public AudioGroup(AudioWrapper[] clips) {
        for (var c : clips) {
            if (c == null) continue;
            queue.add(c);
        }
        queue.sort(comparator);
    }

    public void play() {
        FXUtils.runOnFX(this::playFX);
    }

    private void playFX() {
        if (queue.size() == 0) {
            return;
        }
        if (queue.size() == 1) {
            var audio = queue.peek();
            if (audio != null) {
                audio.play();
            }
            return;
        }
        var last = queue.peekLast();
        var lastRemoved = false;
        if (last.isLastPlayed()) {
            queue.removeLast();
            last.setLastPlayed(false);
            lastRemoved = true;
        }

        var ls = new ArrayList<AudioWrapper>();
        var lastCount = -1;
        for (var a : queue) {
            if (lastCount == -1) {
                lastCount = a.getCount();
                ls.add(a);
            } else {
                if (lastCount != a.getCount()) {
                    break;
                }
                ls.add(a);
            }
        }
        var audio = ls.get(ThreadLocalRandom.current().nextInt(ls.size()));
        queue.remove(audio);
        audio.play();
        audio.setLastPlayed(true);
        if (lastRemoved) {
            queue.add(last);
        }
        queue.add(audio);
    }
}
