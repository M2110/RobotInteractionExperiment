package de.dollendorf.rie

import kotlinx.serialization.json.Json
import java.io.FileNotFoundException

class Config(path: String) : JsonLoader(path) {

    fun loadConfig(){
        try {
            super.loadData()
        }
        catch (e: FileNotFoundException) {
            println("Loading default values.")
            loadDefaults()
        }
    }

    private fun loadDefaults() {
        val config = Json.parseToJsonElement("""{"experiment": null, "language": "de_DE", "port": 8080, "speech_speed": 75, "speech_pitch": 80}""")
        super.writeData(config.toString())
    }
}