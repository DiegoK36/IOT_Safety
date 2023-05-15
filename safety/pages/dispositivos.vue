<template>
  <div>
    <!-- Añadir un Dispositivo -->
    <div class="row">
      <card card-body-classes="table-full-width">
        <div slot="header">
          <h4 class="card-title">Añadir Nuevo Dispositivo</h4>
        </div>

        <div class="row">
          <div class="col-4">
            <base-input
              label="Nombre del Dispositivo"
              type="text"
              placeholder="Ingresa un Nombre"
              v-model="newDevice.name"
            >
            </base-input>
          </div>

          <div class="col-4">
            <base-input
              label="ID del Dispositivo"
              type="text"
              placeholder="Ingresa el ID"
              v-model="newDevice.dId"
            >
            </base-input>
          </div>

          <div class="col-4">
            <slot name="label">
              <label> Plantilla </label>
            </slot>

            <el-select
              v-model="selectedIndexTemplate"
              placeholder="Selecciona una Plantilla"
              class="select-primary"
              style="width: 100%"
            >
              <el-option
                v-for="(template, index) in templates"
                class="text-dark"
                :key="template._id"
                :value="index"
                :label="template.name"
              >
              </el-option>
            </el-select>
          </div>
        </div>

        <div class="row pull-right">
          <div class="col-12">
            <base-button
              @click="createNewDevice()"
              type="primary"
              class="mb-3"
              size="lg"
              >Añadir</base-button
            >
          </div>
        </div>
      </card>
    </div>

    <!-- Tabla de Dispositivos -->
    <div class="row">
      <card card-body-classes="table-full-width">
        <h4 slot="header" class="card-title">Dispositivos</h4>
        <el-table :data="$store.state.devices">
          <el-table-column
            property="$"
            label="#"
            min-width="150"
            align="center"
          >
            <div slot-scope="{ row, $index }">
              {{ $index + 1 }}
            </div>
          </el-table-column>

          <el-table-column
            property="name"
            label="Nombre"
            min-width="150"
            align="center"
          ></el-table-column>

          <el-table-column
            property="dId"
            label="ID Dispositivo"
            min-width="150"
            align="center"
          ></el-table-column>

          <el-table-column
            property="password"
            label="Contraseña"
            min-width="150"
            align="center"
          ></el-table-column>

          <el-table-column
            property="templateId"
            label="ID de Plantilla"
            min-width="150"
            align="center"
          ></el-table-column>

          <el-table-column
            property="templateName"
            label="Plantilla"
            min-width="150"
            align="center"
          ></el-table-column>

          <el-table-column
            property="Eliminate"
            label="Eliminar"
            min-width="150"
            align="center"
          >
            <div slot-scope="{ row, $index }">
              <el-tooltip
                content="Eliminar"
                effect="light"
                :open-delay="300"
                placement="top"
              >
                <base-button
                  type="danger"
                  icon
                  size="sm"
                  class="btn-link"
                  @click="deleteDevice(row)"
                >
                  <i class="tim-icons icon-simple-remove"></i>
                </base-button>
              </el-tooltip>
            </div>
          </el-table-column>
          <el-table-column
            property="SaveDDBB"
            label="Guardar DDBB"
            min-width="150"
            align="center"
          >
            <div slot-scope="{ row, $index }">
              <el-tooltip
                content="Indicador DB"
                effect="light"
                style="margin-right: 6px"
                align="center"
              >
                <i
                  class="fas fa-database"
                  :class="{
                    'text-success': row.saverRule.status,
                    'text-danger': !row.saverRule.status,
                  }"
                ></i>
              </el-tooltip>

              <el-tooltip content="Guardar Database" effect="light">
                <base-switch
                  type="blue"
                  @click="updateRule(row.saverRule)"
                  :value="row.saverRule.status"
                  on-text="On"
                  off-text="Off"
                >
                </base-switch>
              </el-tooltip>
            </div>
          </el-table-column>
        </el-table>
      </card>
    </div>
  </div>
</template>

<script>
import { Table, TableColumn } from "element-ui";
import { Select, Option } from "element-ui";
import BaseSwitch from "../components/BaseSwitch.vue";
import Json from "../components/Json.vue";

export default {
  middleware: "Identificado",
  components: {
    BaseSwitch,
    Json,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Option.name]: Option,
    [Select.name]: Select,
  },

  data() {
    return {
      templates: [],
      selectedIndexTemplate: null,
      newDevice: {
        name: "",
        dId: "",
        templateId: "",
        templateName: "",
      },
    };
  },
  mounted() {
    this.getTemplates();
  },
  methods: {
    updateRule(rule) {
      var ruleCopy = JSON.parse(JSON.stringify(rule));
      ruleCopy.status = !ruleCopy.status;

      const toSend = {
        rule: ruleCopy,
      };

      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };

      this.$axios
        .put("/regla-guardado", toSend, axiosHeaders)
        .then((res) => {
          if (res.data.status == "Éxito") {
            this.$store.dispatch("getDevices");
          }
          return;
        })
        .catch((e) => {
          console.log(e);
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Error al actualizar la Regla de Guardado",
          });
          return;
        });
    },

    // Crear un nuevo Dispositivo
    createNewDevice() {
      if (this.newDevice.name == "") {
        this.$notify({
          type: "warning",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Introduce un nombre para el dispositivo",
        });
        return;
      }
      if (this.newDevice.dId == "") {
        this.$notify({
          type: "warning",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Introduce un ID para el dispositivo",
        });
        return;
      }
      if (this.selectedIndexTemplate == null) {
        this.$notify({
          type: "warning",
          icon: "tim-icons icon-alert-circle-exc",
          message: "Debes seleccionar una Plantilla",
        });
        return;
      }
      const axiosHeaders = {
        headers: {
          token: this.$store.state.auth.token,
        },
      };

      // Guardamos el nombre e ID de la plantilla en el objeto
      this.newDevice.templateId =
        this.templates[this.selectedIndexTemplate]._id;
      this.newDevice.templateName =
        this.templates[this.selectedIndexTemplate].name;
      const enviar = {
        newDevice: this.newDevice,
      };
      this.$axios
        .post("/dispositivos", enviar, axiosHeaders)
        .then((res) => {
          if (res.data.status == "Éxito") {
            this.$store.dispatch("getDevices");
            this.newDevice.name = "";
            this.newDevice.dId = "";
            this.selectedIndexTemplate = null;
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: "El dispositivo se ha guardado con éxito!",
            });
            return;
          }
        })
        .catch((e) => {
          if (
            e.response.data.status == "Error" &&
            e.response.data.error.errors.dId.kind == "unique"
          ) {
            this.$notify({
              type: "warning",
              icon: "tim-icons icon-alert-circle-exc",
              message: "Ya existe ese dispositivo. Prueba con otro",
            });
            return;
          } else {
            this.showNotify("danger", "Error");
            return;
          }
        });
    },

    // Obtenemos las Plantillas
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

    // Borrar un Dispositivo
    deleteDevice(device) {
      const axiosHeader = {
        headers: {
          token: this.$store.state.auth.token,
        },
        params: {
          dId: device.dId,
        },
      };
      this.$axios
        .delete("/dispositivos", axiosHeader)
        .then((res) => {
          if (res.data.status == "Éxito") {
            this.$notify({
              type: "success",
              icon: "tim-icons icon-check-2",
              message: device.name + " ha sido eliminado",
            });
            this.$store.dispatch("getDevices");
          }
        })
        .catch((e) => {
          console.log(e);
          this.$notify({
            type: "danger",
            icon: "tim-icons icon-alert-circle-exc",
            message: "Error al eliminar " + device.name,
          });
        });
    },
  },
};
</script>
