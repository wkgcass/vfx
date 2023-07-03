# VFX

## Add Dependency

```groovy
implementation 'io.vproxy:vfx:1.3.3'
```

```xml
<dependency>
  <groupId>io.vproxy</groupId>
  <artifactId>vfx</artifactId>
  <version>1.3.3</version>
</dependency>
```

> If you are using vfx with kotlin, you may need to see [vjson](https://github.com/wkgcass/vjson) for more info about how to exclude `kotlin-stdlib-lite`.  
> If you are not using kotlin, you can ignore this.

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

> This demo doesn't contain tutorial code, but you can goto `src/test/java/io/vproxy/vfx/intro` to see all code of this demo.  
> The managers, control functions, utilities and other non-UI stuff are not presented in this demo.  
> However, this library very is simple, you can read each code snippet in less than one minute.  
> Currently no plan on making a detailed doc about this project.  
> You can find usage of this library in `vproxy-ui`, `xbox-relay` and `hotta-pc-assistant`.  
> If you want to read this project, check the `module-info.java` first, which will give you a general view of what this library provides.

Please note that this project is currently only made to meet my own needs. Some UI design patterns are hard coded, for example most paddings of the UI components are stored in static fields and do not allow you to modify them.  
If you want to make some changes, you might have to modify the source codes.

PRs are welcome, we can make it better!

Finally, the most important part of this announcement: I might make incompatible API upgrades if really needed.
