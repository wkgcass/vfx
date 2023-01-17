package io.vproxy.vfx.manager.task;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class TaskManager {
    private static final TaskManager instance = new TaskManager();

    private TaskManager() {
    }

    public static TaskManager get() {
        return instance;
    }

    private final ExecutorService threadPool = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors() * 4);

    public void execute(Runnable r) {
        threadPool.execute(r);
    }

    public void terminate() {
        threadPool.shutdown();
    }
}
