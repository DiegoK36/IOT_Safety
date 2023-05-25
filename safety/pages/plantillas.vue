<template>
  <div>
    <!-- Configuración de Widgets -->
    <div class="row">
      <card>
        <div slot="header">
          <h4 class="card-title">Añadir un Widget</h4>
        </div>

        <div class="row">
          <!-- Selector y Formulario -->
          <div class="col-6">
            <!-- Selector de Widgets -->
            <el-select
              v-model="widgetType"
              class="select-success"
              placeholder="Selecciona un Widget"
              style="width: 100%"
            >
              <el-option
                class="text-dark"
                value="grafico"
                label="Gráfico de Valores"
              >
              </el-option>
              <el-option
                class="text-dark"
                value="indicador"
                label="Indicator de Entrada"
              >
              </el-option>
              <el-option
                class="text-dark"
                value="switch"
                label="Switch de Salida"
              >
              </el-option>
              <el-option
                class="text-dark"
                value="boton"
                label="Botón de Salida"
              >
              </el-option>
            </el-select>

            <br />
            <br />

            <!-- Formulario Gráfico -->
            <div v-if="widgetType == 'grafico'">
              <base-input
                v-model="ncConfig.variableFullName"
                label="Nombre de la Variable"
                type="text"
              >
              </base-input>

              <base-input v-model="ncConfig.unit" label="Unit" type="text">
              </base-input>

              <base-input
                v-model.number="ncConfig.decimalPlaces"
                label="Número de Decimales"
                type="number"
              >
              </base-input>

              <base-input
                v-model="ncConfig.icon"
                label="Icono - FaIcons"
                type="text"
              >
              </base-input>

              <br />

              <base-input
                v-model.number="ncConfig.variableSendFreq"
                label="Frecuencia de Envío"
                type="number"
              >
              </base-input>

              <br />

              <base-input
                v-model.number="ncConfig.chartTimeAgo"
                label="Tiempo de medida del Gráfico (Minutos)"
                type="number"
              >
              </base-input>

              <br />

              <el-select
                v-model="ncConfig.class"
                class="select-success"
                placeholder="Selecciona un Color"
                style="width: 100%"
              >
                <el-option class="text-success" value="success" label="Verde">
                </el-option>
                <el-option class="text-primary" value="primary" label="Rosa">
                </el-option>
                <el-option class="text-warning" value="warning" label="Naranja">
                </el-option>
                <el-option class="text-danger" value="danger" label="Rojo">
                </el-option>
              </el-select>

              <br /><br /><br />

              <el-select
                v-model="ncConfig.column"
                class="select-success"
                placeholder="Selecciona el Tamaño del Widget"
                style="width: 100%"
              >
                <el-option class="text-dark" value="col-3" label="col-3">
                </el-option>
                <el-option class="text-dark" value="col-4" label="col-4">
                </el-option>
                <el-option class="text-dark" value="col-5" label="col-5">
                </el-option>
                <el-option class="text-dark" value="col-6" label="col-6">
                </el-option>
                <el-option class="text-dark" value="col-7" label="col-7">
                </el-option>
                <el-option class="text-dark" value="col-8" label="col-8">
                </el-option>
                <el-option class="text-dark" value="col-9" label="col-9">
                </el-option>
                <el-option class="text-dark" value="col-10" label="col-10">
                </el-option>
                <el-option class="text-dark" value="col-11" label="col-11">
                </el-option>
                <el-option class="text-dark" value="col-12" label="col-12">
                </el-option>
              </el-select>

              <br /><br />
            </div>

            <!-- Formulario Switch -->
            <div v-if="widgetType == 'switch'">
              <base-input
                v-model="SwitchConfig.variableFullName"
                label="Nombre de la Variable"
                type="text"
              >
              </base-input>

              <base-input v-model="SwitchConfig.icon" label="Icono" type="text">
              </base-input>

              <br />

              <el-select
                v-model="SwitchConfig.class"
                class="select-success"
                placeholder="Select Class"
                style="width: 100%"
              >
                <el-option class="text-success" value="success" label="Verde">
                </el-option>
                <el-option class="text-primary" value="primary" label="Rosa">
                </el-option>
                <el-option class="text-warning" value="warning" label="Naranja">
                </el-option>
                <el-option class="text-danger" value="danger" label="Rojo">
                </el-option>
              </el-select>

              <br /><br /><br />

              <el-select
                v-model="SwitchConfig.column"
                class="select-success"
                placeholder="Select Column Width"
                style="width: 100%"
              >
                <el-option class="text-dark" value="col-3" label="col-3">
                </el-option>
                <el-option class="text-dark" value="col-4" label="col-4">
                </el-option>
                <el-option class="text-dark" value="col-5" label="col-5">
                </el-option>
                <el-option class="text-dark" value="col-6" label="col-6">
                </el-option>
                <el-option class="text-dark" value="col-7" label="col-7">
                </el-option>
                <el-option class="text-dark" value="col-8" label="col-8">
                </el-option>
                <el-option class="text-dark" value="col-9" label="col-9">
                </el-option>
                <el-option class="text-dark" value="col-10" label="col-10">
                </el-option>
                <el-option class="text-dark" value="col-11" label="col-11">
                </el-option>
                <el-option class="text-dark" value="col-12" label="col-12">
                </el-option>
              </el-select>

              <br /><br />
            </div>

            <!-- Formulario Botón -->
            <div v-if="widgetType == 'boton'">
              <base-input
                v-model="configButton.variableFullName"
                label="Nombre de la Variable"
                type="text"
              >
              </base-input>

              <base-input
                v-model="configButton.message"
                label="Mensaje para Enviar"
                type="text"
              >
              </base-input>

              <base-input
                v-model="configButton.text"
                label="Texto del Botón"
                type="text"
              >
              </base-input>

              <base-input
                v-model="configButton.icon"
                label="Icono del Widget"
                type="text"
              >
              </base-input>

              <br />

              <el-select
                v-model="configButton.class"
                class="select-success"
                placeholder="Select Class"
                style="width: 100%"
              >
                <el-option class="text-success" value="success" label="Verde">
                </el-option>
                <el-option class="text-primary" value="primary" label="Rosa">
                </el-option>
                <el-option class="text-warning" value="warning" label="Naranja">
                </el-option>
                <el-option class="text-danger" value="danger" label="Rojo">
                </el-option>
              </el-select>

              <br /><br /><br />

              <el-select
                v-model="configButton.column"
                class="select-success"
                placeholder="Select Column Width"
                style="width: 100%"
              >
                <el-option class="text-dark" value="col-3" label="col-3">
                </el-option>
                <el-option class="text-dark" value="col-4" label="col-4">
                </el-option>
                <el-option class="text-dark" value="col-5" label="col-5">
                </el-option>
                <el-option class="text-dark" value="col-6" label="col-6">
                </el-option>
                <el-option class="text-dark" value="col-7" label="col-7">
                </el-option>
                <el-option class="text-dark" value="col-8" label="col-8">
                </el-option>
                <el-option class="text-dark" value="col-9" label="col-9">
                </el-option>
                <el-option class="text-dark" value="col-10" label="col-10">
                </el-option>
                <el-option class="text-dark" value="col-11" label="col-11">
                </el-option>
                <el-option class="text-dark" value="col-12" label="col-12">
                </el-option>
              </el-select>

              <br /><br />
            </div>

            <!-- Formulario Indicador -->
            <div v-if="widgetType == 'indicador'">
              <base-input
                v-model="IndicatorConfig.variableFullName"
                label="Nombre de la Variable"
                type="text"
              >
              </base-input>

              <base-input
                v-model="IndicatorConfig.icon"
                label="Icono"
                type="text"
              >
              </base-input>

              <br />

              <base-input
                v-model="IndicatorConfig.variableSendFreq"
                label="Frecuencia de Envío"
                type="text"
              >
              </base-input>

              <br />

              <el-select
                v-model="IndicatorConfig.class"
                class="select-success"
                placeholder="Select Class"
                style="width: 100%"
              >
                <el-option class="text-success" value="success" label="Verde">
                </el-option>
                <el-option class="text-primary" value="primary" label="Rosa">
                </el-option>
                <el-option class="text-warning" value="warning" label="Naranja">
                </el-option>
                <el-option class="text-danger" value="danger" label="Rojo">
                </el-option>
              </el-select>

              <br /><br /><br />

              <el-select
                v-model="IndicatorConfig.column"
                class="select-success"
                placeholder="Select Column Width"
                style="width: 100%"
              >
                <el-option class="text-dark" value="col-3" label="col-3">
                </el-option>
                <el-option class="text-dark" value="col-4" label="col-4">
                </el-option>
                <el-option class="text-dark" value="col-5" label="col-5">
                </el-option>
                <el-option class="text-dark" value="col-6" label="col-6">
                </el-option>
                <el-option class="text-dark" value="col-7" label="col-7">
                </el-option>
                <el-option class="text-dark" value="col-8" label="col-8">
                </el-option>
                <el-option class="text-dark" value="col-9" label="col-9">
                </el-option>
                <el-option class="text-dark" value="col-10" label="col-10">
                </el-option>
                <el-option class="text-dark" value="col-11" label="col-11">
                </el-option>
                <el-option class="text-dark" value="col-12" label="col-12">
                </el-option>
              </el-select>

              <br /><br />
            </div>
          </div>

          <!-- Preview del Widget -->
          <div class="col-6">
            <Grafico v-if="widgetType == 'grafico'" :config="ncConfig">
            </Grafico>
            <SwitchSafe v-if="widgetType == 'switch'" :config="SwitchConfig">
            </SwitchSafe>
            <Boton v-if="widgetType == 'boton'" :config="configButton"> </Boton>
            <Indicador
              v-if="widgetType == 'indicador'"
              :config="IndicatorConfig"
            >
            </Indicador>
          </div>
        </div>

        <!-- Botón de Añadir Widget -->
        <div class="row pull-right">
          <div class="col-12">
            <base-button
              native-type="submit"
              type="primary"
              class="mb-3"
              size="lg"
              @click="addNewWidget()"
            >
              Añadir Widget
            </base-button>
          </div>
        </div>
      </card>
    </div>

    <!-- Dashboard Preview -->
    <div class="row">
      <div
        v-for="(widget, index) in widgets"
        :key="index"
        :class="[widget.column]"
      >
        <i
          aria-hidden="true"
          class="fa fa-trash text-warning pull-right"
          @click="deleteWidget(index)"
          style="margin-bottom: 10px"
        ></i>

        <Grafico v-if="widget.widget == 'grafico'" :config="widget"></Grafico>

        <SwitchSafe
          v-if="widget.widget == 'switch'"
          :config="widget"
        ></SwitchSafe>

        <Boton v-if="widget.widget == 'boton'" :config="widget"></Boton>

        <Indicador
          v-if="widget.widget == 'indicador'"
          :config="widget"
        ></Indicador>
      </div>
    </div>

    <!-- Formulario Guardar Plantilla -->
    <div class="row">
      <card>
        <div slot="header">
          <h4 class="card-title">Guardar Plantilla</h4>
        </div>

        <div class="row">
          <base-input
            class="col-4"
            v-model="templateName"
            label="Nombre"
            type="text"
          >
          </base-input>

          <base-input
            class="col-8"
            v-model="templateDescription"
            label="Descripción"
            type="text"
          >
          </base-input>
        </div>

        <br /><br />

        <div class="row">
          <div class="col-12">
            <base-button
              native-type="submit"
              type="primary"
              class="mb-3 pull-right"
              size="lg"
              @click="guardarPlantilla()"
              :disabled="widgets.length == 0"
            >
              Guardar
            </base-button>
          </div>
        </div>
      </card>
    </div>

    <!-- Tabla de Plantillas -->
    <div class="row">
      <card>
        <div slot="header">
          <h4 class="card-title">Plantillas</h4>
        </div>

        <div class="row">
          <el-table :data="templates">
            <el-table-column min-width="50" label="#" align="center" property="1">
              <div class="photo" slot-scope="{ row, $index }">
                {{ $index + 1 }}
              </div>
            </el-table-column>

            <el-table-column property="name" label="Nombre" align="center"></el-table-column>

            <el-table-column
            property="description"
              label="Descripción"
              align="center"
            ></el-table-column>

            <el-table-column
            property="widgets.length"
              label="Widgets"
              align="center"
            ></el-table-column>

            <el-table-column header-align="center" align="center" label="Borrar" property="2">
              <div
                slot-scope="{ row, $index }"
                class="text-center table-actions"
              >
                <el-tooltip
                  content="Delete"
                  effect="light"
                  :open-delay="300"
                  placement="top"
                >
                  <base-button
                    @click="deleteTemplate(row)"
                    type="danger"
                    icon
                    size="sm"
                    class="btn-link"
                  >
                    <i class="tim-icons icon-simple-remove"></i>
                  </base-button>
                </el-tooltip>
              </div>
            </el-table-column>
          </el-table>
        </div>
      </card>
    </div>
  </div>
</template>

<script>
import { Table, TableColumn } from "element-ui";
import { Select, Option } from "element-ui";
import Indicador from "../components/Widgets/Indicador.vue";
import Boton from "../components/Widgets/Boton.vue";
import Grafico from "../components/Widgets/Grafico.vue";
import SwitchSafe from "../components/Widgets/SwitchSafe.vue";
import Json from "../components/Json.vue";

export default {
  middleware: "Identificado",
  components: {
    Indicador,
    Boton,
    Grafico,
    SwitchSafe,
    Json,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Option.name]: Option,
    [Select.name]: Select,
  },

  data() {
    return {
      widgets: [],
      templates: [],
      widgetType: "",
      templateName: "",
      templateDescription: "",

      ncConfig: {
        userId: "",
        selectedDevice: {
          name: "",
          dId: "",
        },
        variableFullName: "Temperatura",
        variable: "varname",
        variableType: "input",
        variableSendFreq: "30",
        unit: "ºC",
        class: "danger",
        column: "col-12",
        decimalPlaces: 2,
        widget: "grafico",
        icon: "fa-thermometer",
        chartTimeAgo: 60,
        demo: true,
      },

      SwitchConfig: {
        userId: "",
        selectedDevice: {
          name: "",
          dId: "",
        },
        variableFullName: "Luz",
        variable: "varname",
        variableType: "output",
        class: "danger",
        widget: "switch",
        icon: "fa-sun",
        column: "col-6",
      },

      IndicatorConfig: {
        userId: "",
        selectedDevice: {
          name: "",
          dId: "",
        },
        variableFullName: "Flama",
        variable: "varname",
        variableType: "input",
        variableSendFreq: "30",
        class: "success",
        widget: "indicador",
        icon: "fa-sun",
        column: "col-6",
      },

      configButton: {
        userId: "",
        selectedDevice: {
          name: "",
          dId: "",
          templateName: "",
          templateId: "",
          saverRule: null,
        },
        variableFullName: "Luz",
        variable: "var1",
        variableType: "output",
        icon: "fa-sun",
        column: "col-4",
        widget: "boton",
        class: "danger",
        message: "",
      },
    };
  },
  mounted() {
    this.getTemplates();
  },

  methods: {
    // Lista de Plantillas
    async getTemplates() {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };
      try {
        const res = await this.$axios.get("/plantillas", axiosHeaders);
        console.log(res.data);
        if (res.data.status == "Éxito") {
          this.templates = res.data.data;
        }
      } catch (error) {
        this.$notify({
          type: "danger",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Error al obtener las Plantillas",
        });
        console.log(error);
        return;
      }
    },
    // Guardar una Plantilla
    async guardarPlantilla() {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };
      const toSend = {
        template: {
          name: this.templateName,
          description: this.templateDescription,
          widgets: this.widgets,
        },
      };
      try {
        const res = await this.$axios.post("/plantillas", toSend, axiosHeaders);
        if (res.data.status == "Éxito") {
          this.templateName = "";
          this.templateDescription = "";
          this.$notify({
            type: "success",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Plantilla guardada!",
          });
          this.getTemplates();
          this.widgets = [];
        }
      } catch (error) {
        this.$notify({
          type: "danger",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Error al guardar la plantilla",
        });
        console.log(error);
        return;
      }
    },
    // Borrar una Plantilla
    async deleteTemplate(template) {
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token,
        },
        params: {
          templateId: template._id,
        },
      };
      console.log(axiosHeaders);
      try {
        const res = await this.$axios.delete("/plantillas", axiosHeaders);
        console.log(res.data);
        if (
          res.data.status == "Fallo" &&
          res.data.error == "Plantilla en uso"
        ) {
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message:
              template.name +
              " está en uso. Primero elimina los dispositivos asociados a la plantilla",
          });

          return;
        }
        if (res.data.status == "Éxito") {
          this.$notify({
            type: "success",
            icon: "tim-icons icon-check-2",
            message: template.name + " ha sido eliminada!",
          });

          this.getTemplates();
        }
      } catch (error) {
        this.$notify({
          type: "danger",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Error al obtener las plantillas",
        });
        console.log(error);
        return;
      }
    },

    // Añadir un Widget
    addNewWidget() {
      if (this.widgetType == "grafico") {
        this.ncConfig.variable = this.makeid(10);
        this.widgets.push(JSON.parse(JSON.stringify(this.ncConfig)));
      }
      if (this.widgetType == "switch") {
        this.SwitchConfig.variable = this.makeid(10);
        this.widgets.push(JSON.parse(JSON.stringify(this.SwitchConfig)));
      }
      if (this.widgetType == "boton") {
        this.configButton.variable = this.makeid(10);
        this.widgets.push(JSON.parse(JSON.stringify(this.configButton)));
      }
      if (this.widgetType == "indicador") {
        this.IndicatorConfig.variable = this.makeid(10);
        this.widgets.push(JSON.parse(JSON.stringify(this.IndicatorConfig)));
      }
    },

    // Borrar un Widget
    deleteWidget(index) {
      this.widgets.splice(index, 1);
    },

    // Crear un ID Aleatorio
    makeid(length) {
      var result = "";
      var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    },
  },
};
</script>
