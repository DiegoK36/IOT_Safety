#include <Arduino.h>
#include "Colors.h"
#include "SafetySplitter.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <Wire.h>

String dId = "3030";
String webhook_pass = "L9BpZCfH4x";
String webhook_endpoint = "http://192.168.226.182:3001/api/getdevicecredentials";
const char *mqtt_server = "192.168.226.182";

// PINES DE ESP32
#define timeSeconds 10
int LED = 32;
int Sensor_input = 4;
const int led = 26;
const int motionSensor = 27;
unsigned long now = millis();
unsigned long lastTrigger = 0;
boolean startTimer = false;
boolean motion = false;
const long interval = 1000;     

// Credenciales Wi-Fi
const char *wifi_ssid = "OPPO";
const char *wifi_password = "123456789";

// Definiciones de Funciones
bool get_mqtt_credentials();
void check_mqtt_connection();
bool reconnect();
void process_sensors();
void send_data_to_broker();
void callback(char *topic, byte *payload, unsigned int length);
void process_incoming_msg(String topic, String incoming);
void print_stats();
void clear();
void IRAM_ATTR detectsMovement();

// Variables Globales
WiFiClient espclient;
PubSubClient client(espclient);
SafetySplitter splitter;
long varsLastSend[20];
long lastReconnectAttemp = 0;
String last_received_msg = "";
String last_received_topic = "";
int prev_gas = 0;

DynamicJsonDocument mqtt_data_doc(2048);

// Confguración inical de la Placa ESP32
void setup()
{

  Serial.begin(921600);
  pinMode(LED, OUTPUT);
  pinMode(motionSensor, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(motionSensor), detectsMovement, RISING);
  pinMode(led, OUTPUT);
  digitalWrite(led, LOW);
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
  int nivel_gas = analogRead(Sensor_input);

  // Valor de Temperatura Simulado
  mqtt_data_doc["variables"][0]["last"]["value"] = nivel_gas;

  if (nivel_gas > 1800) {   
    digitalWrite (LED, HIGH) ; 
  }
  else {
    digitalWrite (LED, LOW) ;  
  }

  // ¿Guardar en base de datos?
  int dif_gas = nivel_gas - prev_gas;
  if (dif_gas < 0)
  {
    dif_gas *= -1;
  }

  if (dif_gas >= 0.1)
  {
    mqtt_data_doc["variables"][0]["last"]["save"] = 1;
  }
  else
  {
    mqtt_data_doc["variables"][0]["last"]["save"] = 0;
  }

  prev_gas = nivel_gas;

  now = millis();
  if((digitalRead(led) == HIGH) && (motion == false)) {
    motion = true;
  }
  if(startTimer && (now - lastTrigger > (timeSeconds*1000))) {
    digitalWrite(led, LOW);
    startTimer = false;
    motion = false;
  }

  // Obtener el Valor de LED de Sensor de Movimiento
  mqtt_data_doc["variables"][1]["last"]["value"] = (HIGH == digitalRead(led));

  // Obtener el valor GAS
  mqtt_data_doc["variables"][2]["last"]["value"] = (HIGH == digitalRead(LED));

}

void IRAM_ATTR detectsMovement() {
  digitalWrite(led, HIGH);
  startTimer = true;
  lastTrigger = millis();
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
    Serial.print(boldGreen + "\n\n Nivel Gas ->" + digitalRead(Sensor_input));
  }
}