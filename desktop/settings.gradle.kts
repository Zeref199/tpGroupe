pluginManagement {
    plugins {
        val pluginsVersion = "14.1.2"
        id("beyond.gradle.plugins.structure").version(pluginsVersion)
    }
    repositories.clear()
    repositories.maven {
        url = uri("https://maven.beyond.cegedim.cloud/release")
        name = "beyond-release"
    }
}

plugins {
    // automatically include all projects
    id("beyond.gradle.plugins.structure")
}
