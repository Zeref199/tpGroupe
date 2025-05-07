plugins {
    id("beyond.gradle.plugins.python-app")
}

pythonAppExtension {
    unitTestsDirectoryPath = project.relativePath("unit")
    isActivateLint = false
}

docker {
    files("entrypoint.sh")
}

