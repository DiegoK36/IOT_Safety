<template>
  <div>
    <!-- FORM ADD DEVICE -->
    <div class="row">
      <card>
        <div slot="header">
          <h4 class="card-title">Añadir nuevo Dispositivo</h4>
        </div>

        <div class="row">
          <div class="col-4">
            <base-input
              label="Nombre del Dispositivo"
              type="text"
              placeholder="Ingresa un Nombre"
            >
            </base-input>
          </div>

          <div class="col-4">
            <base-input
              label="ID del Dispositivo"
              type="text"
              placeholder="Ingresa el ID"
            >
            </base-input>
          </div>

          <div class="col-4">
            <slot name="label">
              <label> Plantilla </label>
            </slot>

            <el-select
              value="1"
              placeholder="Selecciona una Plantilla"
              class="select-primary"
              style="width:100%"
            >
              <el-option
                class="text-dark"
                value="Plantilla 1"
                label="Plantilla 1"
              ></el-option>

              <el-option
                class="text-dark"
                value="Plantilla 2"
                label="Plantilla 2"
              ></el-option>

              <el-option
                class="text-dark"
                value="Plantilla 3"
                label="Plantilla 3"
              ></el-option>

            </el-select>
          </div>
        </div>

        <div class="row pull-right">
          <div class="col-12">
            <base-button
              type="primary"
              class="mb-3"
              size="lg"
              >Añadir</base-button
            >
          </div>
        </div>
      </card>
    </div>

    <!-- DEVICES TABLE -->
    <div class="row">
      <card>
        <div slot="header">
          <h4 class="card-title">Dispositivos</h4>
        </div>

        <el-table :data="devices">
          <el-table-column label="#" min-width="50" align="center">
            <div slot-scope="{ row, $index }">
              {{ $index + 1 }}
            </div>
          </el-table-column>

          <el-table-column prop="name" label="Nombre"></el-table-column>

          <el-table-column prop="dId" label="ID Dispositivo"></el-table-column>

          <el-table-column prop="password" label="Password"></el-table-column>

          <el-table-column
            prop="templateName"
            label="Plantilla"
          ></el-table-column>

          <el-table-column label="Actions">
          </el-table-column>
        </el-table>
      </card>
    </div>
  </div>
</template>

<script>
import { Table, TableColumn } from "element-ui";
import { Select, Option } from "element-ui";
export default {
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Option.name]: Option,
    [Select.name]: Select
  },
  data() {
    return {
      devices: [{
        name: "Oficina 1",
        dId: "1",
        templateId: "Gas Sensor",
        templateName: "Tabla 1"
      },
      {
        name: "Oficina 1",
        dId: "1",
        templateId: "Gas Sensor",
        templateName: "Tabla 1"
      },
      {
        name: "Oficina 1",
        dId: "1",
        templateId: "Gas Sensor",
        templateName: "Tabla 1"
      }
      ]
    };
  },
}
</script>