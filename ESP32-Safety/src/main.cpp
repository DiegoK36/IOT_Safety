#include <Arduino.h>
#include "Colors.h"
#include "SafetySplitter.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
#include <Wire.h>
#include <BH1750.h>

String dId = "2020";
String webhook_pass = "S53gMXQFZ1     ";
String webhook_endpoint = "http://192.168.226.182:3001/api/getdevicecredentials";
const char *mqtt_server = "192.168.226.182";

// PINES DE ESP32
#define led 2
#define DHTPIN 4
#define DHTTYPE DHT11
#define FLAME_SENSOR_PIN 33
#define Buzzer 32
BH1750 lightMeter;


DHT dht(DHTPIN, DHTTYPE);

// Credenciales Wi-Fi
const char *wifi_ssid = "OPPO";
const char *wifi_password = "123456789";

// Definiciones de Funciones
bool get_mqtt_credentials();
void check_mqtt_connection();
bool reconnect();
void process_sensors();
void process_actuators();
void send_data_to_broker();
void callback(char *topic, byte *payload, unsigned int length);
void process_incoming_msg(String topic, String incoming);
void print_stats();
void clear();

// Variables Globales
WiFiClient espclient;
PubSubClient client(espclient);
SafetySplitter splitter;
long varsLastSend[20];
long lastReconnectAttemp = 0;
String last_received_msg = "";
String last_received_topic = "";
int prev_temp = 0;
int prev_hum = 0;
int prev_luz = 0;

DynamicJsonDocument mqtt_data_doc(2048);

// Confguración inical de la Placa ESP32
void setup()
{

  Serial.begin(921600);
  pinMode(FLAME_SENSOR_PIN, INPUT);
  pinMode(Buzzer, OUTPUT);
  pinMode(led, OUTPUT);
  clear();

  Serial.print(Cyan + "\n\nConexión WiFi en Proceso" + fontReset);

  WiFi.begin(wifi_ssid, wifi_password);

  int contador = 0;

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
    contador++;

    if (contador > 10)
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

  dht.begin();
  Wire.begin();
  lightMeter.begin();

  client.setCallback(callback);
}

void loop()
{
  check_mqtt_connection();
}

// FUNCIONES DEL USUARIO (Ejemplos Temperatura | Humedad | LED)
void process_sensors()
{

  delay(2000);
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  float lux = lightMeter.readLightLevel();

  if (isnan(h) || isnan(t)) {
    Serial.println(F("Fallo en el sensor DHT11"));
  return;
  }

  // Valor de Temperatura Simulado
  float temp = t;
  mqtt_data_doc["variables"][0]["last"]["value"] = temp;

  // ¿Guardar en base de datos?
  float dif_temp = temp - prev_temp;
  if (dif_temp < 0)
  {
    dif_temp *= -1;
  }

  if (dif_temp >= 0.1)
  {
    mqtt_data_doc["variables"][0]["last"]["save"] = 1;
  }
  else
  {
    mqtt_data_doc["variables"][0]["last"]["save"] = 0;
  }

  prev_temp = temp;

  // Valor de Temperatura Simulado
  float hum = h;
  mqtt_data_doc["variables"][1]["last"]["value"] = hum;

  // Para guardar en base de datos
  float dif_hum = hum - prev_hum;
  if (dif_hum < 0)
  {
    dif_hum *= -1;
  }

  if (dif_hum >= 1)
  {
    mqtt_data_doc["variables"][1]["last"]["save"] = 1;
  }
  else
  {
    mqtt_data_doc["variables"][1]["last"]["save"] = 0;
  }

  prev_hum = hum;

  float luz = lux;
  mqtt_data_doc["variables"][2]["last"]["value"] = luz;

  // Para guardar en base de datos
  float dif_luz = luz - prev_luz;
  if (dif_luz < 0)
  {
    dif_luz *= -1;
  }

  if (dif_luz >= 2)
  {
    mqtt_data_doc["variables"][2]["last"]["save"] = 1;
  }
  else
  {
    mqtt_data_doc["variables"][2]["last"]["save"] = 0;
  }

  prev_luz = luz;
  
  
  // Obtener el Valor de un LED
  mqtt_data_doc["variables"][5]["last"]["value"] = (HIGH == digitalRead(led));

  // Obtener el Valor del Sensor de Flama
  mqtt_data_doc["variables"][6]["last"]["value"] = (LOW == digitalRead(FLAME_SENSOR_PIN));

  if (digitalRead(FLAME_SENSOR_PIN) == LOW) {
    digitalWrite (Buzzer, HIGH) ; 
    delay(100);
    digitalWrite (Buzzer, LOW) ;  
  }
}

void process_actuators()
{
  if (mqtt_data_doc["variables"][3]["last"]["value"] == "true")
  {
    digitalWrite(led, HIGH);
    mqtt_data_doc["variables"][3]["last"]["value"] = "";
    varsLastSend[5] = 0;
    varsLastSend[6] = 0;
  }
  else if (mqtt_data_doc["variables"][4]["last"]["value"] == "false")
  {
    digitalWrite(led, LOW);
    mqtt_data_doc["variables"][4]["last"]["value"] = "";
    varsLastSend[5] = 0;
    varsLastSend[6] = 0;
  }
}

/*

$$$$$$$\  $$\        $$$$$$\  $$\   $$\ $$$$$$$$\ $$$$$$\ $$\       $$\        $$$$$$\  
$$  __$$\ $$ |      $$  __$$\ $$$\  $$ |\__$$  __|\_$$  _|$$ |      $$ |      $$  __$$\ 
$$ |  $$ |$$ |      $$ /  $$ |$$$$\ $$ |   $$ |     $$ |  $$ |      $$ |      $$ /  $$ |
$$$$$$$  |$$ |      $$$$$$$$ |$$ $$\$$ |   $$ |     $$ |  $$ |      $$ |      $$$$$$$$ |
$$  ____/ $$ |      $$  __$$ |$$ \$$$$ |   $$ |     $$ |  $$ |      $$ |      $$  __$$ |
$$ |      $$ |      $$ |  $$ |$$ |\$$$ |   $$ |     $$ |  $$ |      $$ |      $$ |  $$ |
$$ |      $$$$$$$$\ $$ |  $$ |$$ | \$$ |   $$ |   $$$$$$\ $$$$$$$$\ $$$$$$$$\ $$ |  $$ |
\__|      \________|\__|  \__|\__|  \__|   \__|   \______|\________|\________|\__|  \__|
                                                                                        
IMPORTANTE: No se recomienda editar esta parte
Developer: DiegoK36

*/

// Función 2 para Procesar Mensajes Entrantes
void process_incoming_msg(String topic, String incoming){

  last_received_topic = topic;
  last_received_msg = incoming;

  String variable = splitter.split(topic, '/', 2);

  for (int i = 0; i < mqtt_data_doc["variables"].size(); i++ ){

    if (mqtt_data_doc["variables"][i]["variable"] == variable){
      
      DynamicJsonDocument doc(256);
      deserializeJson(doc, incoming);
      mqtt_data_doc["variables"][i]["last"] = doc;

      // Estadísticas
      long counter = mqtt_data_doc["variables"][i]["counter"];
      counter++;
      mqtt_data_doc["variables"][i]["counter"] = counter;

    }

  }

  process_actuators();

}

// Función 1 para Procesar Mensajes Entrantes
void callback(char *topic, byte *payload, unsigned int length)
{

  String incoming = "";

  for (int i = 0; i < length; i++)
  {
    incoming += (char)payload[i];
  }

  incoming.trim();

  process_incoming_msg(String(topic), incoming);

}

// Envío de Datos al Broker MQTX
void send_data_to_broker()
{

  long now = millis();

  for (int i = 0; i < mqtt_data_doc["variables"].size(); i++)
  {

    if (mqtt_data_doc["variables"][i]["variableType"] == "output")
    {
      continue;
    }

    int freq = mqtt_data_doc["variables"][i]["variableSendFreq"];

    if (now - varsLastSend[i] > freq * 1000)
    {
      varsLastSend[i] = millis();

      String str_root_topic = mqtt_data_doc["topic"];
      String str_variable = mqtt_data_doc["variables"][i]["variable"];
      String topic = str_root_topic + str_variable + "/sdata";

      String toSend = "";

      serializeJson(mqtt_data_doc["variables"][i]["last"], toSend);

      client.publish(topic.c_str(), toSend.c_str());

      // Estadísticas
      long counter = mqtt_data_doc["variables"][i]["counter"];
      counter++;
      mqtt_data_doc["variables"][i]["counter"] = counter;

    }
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

  Serial.print(underlinePurple + "\n\n\nProbando Conexión MQTT" + fontReset);

  String str_client_id = "dispositivo_" + dId + "_" + random(1, 9999);
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
    return false;
  }
  return true;
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

// Verifica las Credenciales MQTT
bool get_mqtt_credentials()
{

  Serial.print(underlinePurple + "\n\n\nObteniendo credenciales MQTT del WebHook" + fontReset);
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
    Serial.print(boldRed + "\n\nError en la respuesta de la peticón - Error -> " + fontReset + " " + response_code);
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

long lastStats = 0;

// Imprimir Variables (Visual)
void print_stats()
{
  long now = millis();

  if (now - lastStats > 2000)
  {
    lastStats = millis();
    clear();

    Serial.print("\n");
    Serial.print(Purple + "\n╔════════════════════════════════════════════╗" + fontReset);
    Serial.print(Purple + "\n║                 SYSTEM STATS               ║" + fontReset);
    Serial.print(Purple + "\n╚════════════════════════════════════════════╝" + fontReset);
    Serial.print("\n\n");
    Serial.print("\n\n");

    Serial.print(boldCyan + "#" + " \t Nombre" + " \t\t Variable" + " \t\t Tipo" + " \t\t Contador" + " \t\t Última Variable" + fontReset + "\n\n");

    for (int i = 0; i < mqtt_data_doc["variables"].size(); i++)
    {

      String variableFullName = mqtt_data_doc["variables"][i]["variableFullName"];
      String variable = mqtt_data_doc["variables"][i]["variable"];
      String variableType = mqtt_data_doc["variables"][i]["variableType"];
      String lastMsg = mqtt_data_doc["variables"][i]["last"];
      long counter = mqtt_data_doc["variables"][i]["counter"];

      Serial.println(String(i) + " \t " + variableFullName.substring(0,5) + " \t\t " + variable.substring(0,10) + " \t " + variableType.substring(0,5) + " \t\t " + String(counter).substring(0,10) + " \t\t " + lastMsg);
    }

    Serial.print(boldGreen + "\n\n RAM Libre -> " + fontReset + ESP.getFreeHeap() + " Bytes");

    Serial.print(boldGreen + "\n\n Último Mensaje Entrante -> " + fontReset + last_received_msg);
  }
}