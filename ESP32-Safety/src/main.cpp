#include <Arduino.h>
#include "Colors.h"
#include "SafetySplitter.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>

String dID = "";
String webhook_pass = "";
String webhook_endpoint = "http://TuIP:3001/api/getdevicecredentials";
const char* mqtt_server = "TuIP";

// PINES DE ESP32
#define led 2

// Credenciales Wi-Fi
const char *wifi_ssid = "";
const char *wifi_password = "";

// Definiciones de Funciones
void clear();

void setup() {
  
  Serial.begin(921600);
  pinMode(led, OUTPUT);
  clear();

  WiFi.begin(wifi_ssid, wifi_password);

  Serial.print(Cyan + "\n\nConexión WiFi en Proceso" + fontReset);

  int contador = 0;

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    contador++;

    if (contador > 15) {
      Serial.print("  ⤵" + fontReset);
      Serial.print(Red + "\n\n         Fallo de Conexión WiFi!");
      Serial.println(" -> Reiniciando..." + fontReset);
      delay(2000);
      ESP.restart();
    }
  }

  Serial.print("  ⤵" + fontReset);

  // Imprimimos la IP Local
  Serial.println(boldGreen + "\n\n         Conexión WiFi Exitosa!" + fontReset);
  Serial.print("\n         IP Local -> ");
  Serial.print(boldBlue);
  Serial.print(WiFi.localIP());
  Serial.println(fontReset);

}

void loop() {

}

// Limpia la Terminal
void clear()
{
  Serial.write(27);   
  Serial.print("[2J"); 
  Serial.write(27);
  Serial.print("[H"); 
}