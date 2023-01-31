# VFX

## Add Dependency

```groovy
implementation 'io.vproxy:vfx:1.1.2'
```

```xml
<dependency>
  <groupId>io.vproxy</groupId>
  <artifactId>vfx</artifactId>
  <version>1.1.2</version>
</dependency>
```

## How to Use

Run `./gradlew runIntro` to see the intro demo.

It demostrates:

1. VStage
2. VSceneGroup
3. VScene
4. VScrollPane
5. FusionPane
6. VTableView
7. Animation System
8. ProgressBar & LoadingStage

As well as some other small UI components.

> This demo doesn't contain tutorial code, you can goto `src/test/java/io/vproxy/vfx/intro` to see all code of this demo.  
> The managers, control functions, utilities and other non-UI stuff are not presented in this demo.  
> However, this library very is simple, you can read each code snippet in less than one minute.  
> Currently no plan on making a detailed doc about this project.  
> You can find usage of this library in `vproxy-ui` and `hotta-pc-assistant`.  
> If you want to read this project, check the `module-info.java` first, which will give you a general view of what this library provides.
