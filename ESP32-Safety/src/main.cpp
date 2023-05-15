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
const char *mqtt_server = "TuIP";

// PINES DE ESP32
#define led 2

// Credenciales Wi-Fi
const char *wifi_ssid = "";
const char *wifi_password = "";

// Definiciones de Funciones
void clear();
bool get_mqtt_credentials();
void check_mqtt_connection();
bool reconnect();
void process_sensors();
void process_actuators();

// Variables Globales
WiFiClient espclient;
PubSubClient client(espclient);
DynamicJsonDocument mqtt_data_doc(2048);
SafetySplitter splitter;
long lastReconnectAttemp = 0;
int prev_temp = 0;
int prev_hum = 0;

// Confguración inical de la Placa ESP32
void setup()
{

  Serial.begin(921600);
  pinMode(led, OUTPUT);
  clear();

  WiFi.begin(wifi_ssid, wifi_password);

  Serial.print(Cyan + "\n\nConexión WiFi en Proceso" + fontReset);

  int contador = 0;

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
    contador++;

    if (contador > 15)
    {
      Serial.print(fontReset);
      Serial.print(Red + "\n\nFallo de Conexión WiFi!");
      Serial.println(" -> Reiniciando..." + fontReset);
      delay(2000);
      ESP.restart();
    }
  }

  Serial.print(fontReset);

  // Imprimimos la IP Local
  Serial.println(boldGreen + "\n\nConexión WiFi Exitosa!" + fontReset);
  Serial.print("\nIP Local -> ");
  Serial.print(boldBlue);
  Serial.print(WiFi.localIP());
  Serial.println(fontReset);
}

void loop()
{
  check_mqtt_connection();
}

// FUNCIONES DEL USUARIO (Ejemplos Temperatura | Humedad | LED)
void process_sensors()
{

  // Valor de Temperatura Simulado
  int temp = random(1, 100);
  mqtt_data_doc["variables"][0]["last"]["value"] = temp;

  // Para guardar en base de datos
  int dif = temp - prev_temp;
  if (dif < 0)
  {
    dif *= -1;
  }

  if (dif >= 10)
  {
    mqtt_data_doc["variables"][0]["last"]["save"] = 1;
  }
  else
  {
    mqtt_data_doc["variables"][0]["last"]["save"] = 0;
  }

  prev_temp = temp;

  // Valor de Temperatura Simulado
  int hum = random(1, 50);
  mqtt_data_doc["variables"][1]["last"]["value"] = hum;

  // Para guardar en base de datos
  dif = hum - prev_hum;
  if (dif < 0)
  {
    dif *= -1;
  }

  if (dif >= 10)
  {
    mqtt_data_doc["variables"][1]["last"]["save"] = 1;
  }
  else
  {
    mqtt_data_doc["variables"][1]["last"]["save"] = 0;
  }

  prev_hum = hum;

  // Obtener el Valor de un LED
  mqtt_data_doc["variables"][4]["last"]["value"] = (HIGH == digitalRead(led));
}
void process_actuators()
{
  if (mqtt_data_doc["variables"][2]["last"]["value"] == "true")
  {
    digitalWrite(led, HIGH);
    mqtt_data_doc["variables"][2]["last"]["value"] = "";
    varsLastSend[4] = 0;
  }
  else if (mqtt_data_doc["variables"][3]["last"]["value"] == "false")
  {
    digitalWrite(led, LOW);
    mqtt_data_doc["variables"][3]["last"]["value"] = "";
    varsLastSend[4] = 0;
  }

}

// Verificamos la conexión MQTT
void check_mqtt_connection()
{

  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(Red + "\n\nFallo de Conexión con el Wifi ");
    Serial.println(" -> Reiniciando..." + fontReset);
    delay(15000);
    ESP.restart();
  }

  if (!client.connected())
  {

    long now = millis();

    if (now - lastReconnectAttemp > 5000)
    {
      lastReconnectAttemp = millis();
      if (reconnect())
      {
        lastReconnectAttemp = 0;
      }
    }
  }
  else
  {
    client.loop();
    process_sensors();
    send_data_to_broker();
    print_stats();
  }
}

// Reconexión de MQTT
bool reconnect()
{

  if (!get_mqtt_credentials())
  {
    Serial.println(boldRed + "\n\nError al obtener credenciales MQTT \n\n REINICIANDO EN 10 SEGUNDOS");
    Serial.println(fontReset);
    delay(10000);
    ESP.restart();
  }

  // Configurando Servidor MQTT
  client.setServer(mqtt_server, 1883);

  Serial.print(underlinePurple + "\n\n\nProbando Conexión MQTT" + fontReset + Purple);

  String str_client_id = "device_" + dId + "_" + random(1, 9999);
  const char *username = mqtt_data_doc["username"];
  const char *password = mqtt_data_doc["password"];
  String str_topic = mqtt_data_doc["topic"];

  if (client.connect(str_client_id.c_str(), username, password))
  {
    Serial.print(boldGreen + "\n\nCliente MQTT Conectado" + fontReset);
    delay(2000);

    client.subscribe((str_topic + "+/actdata").c_str());
  }
  else
  {
    Serial.print(boldRed + "\n\nConexión Fallida del Cliente MQTT" + fontReset);
  }
}

// Verifica las Credenciales MQTT
bool get_mqtt_credentials()
{

  Serial.print(underlinePurple + "\n\n\nObteniendo credenciales MQTT del WebHook" + fontReset + Purple);
  delay(1000);

  String toSend = "dId=" + dId + "&password=" + webhook_pass;

  HTTPClient http;
  http.begin(webhook_endpoint);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");

  int response_code = http.POST(toSend);

  if (response_code < 0)
  {
    Serial.print(boldRed + "\n\nError enviando la petición POST " + fontReset);
    http.end();
    return false;
  }

  if (response_code != 200)
  {
    Serial.print(boldRed + "\n\nError en la respuesta de la peticón   Error -> " + fontReset + " " + response_code);
    http.end();
    return false;
  }

  if (response_code == 200)
  {
    String responseBody = http.getString();

    Serial.print(boldGreen + "\n\nCredenciales MQTT Obtenidas con Éxito " + fontReset);

    deserializeJson(mqtt_data_doc, responseBody);
    http.end();
    delay(1000);
  }

  return true;
}

// Limpia la Terminal
void clear()
{
  Serial.write(27);
  Serial.print("[2J");
  Serial.write(27);
  Serial.print("[H");
}