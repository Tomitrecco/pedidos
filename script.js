$(document).ready(function() {
    $('#codigoSelect').select2({ placeholder: "Escribe para buscar un código", allowClear: true });
    $('#clienteSelect').select2({ placeholder: "Selecciona un cliente", allowClear: true });

    // Cargar clientes desde el archivo JSON
    fetch('clientes_data.json')
        .then(response => response.json())
        .then(data => {
            let clienteSelect = $('#clienteSelect');
            clienteSelect.append('<option value="">-- Elige un cliente --</option>');
            data.forEach(cliente => {
                clienteSelect.append(`<option value="${cliente.codigo}">${cliente.nombre}</option>`);
            });
        })
        .catch(error => console.error("Error cargando clientes:", error));

    $('#codigoSelect').on('change', function() {
        let selectedOption = this.options[this.selectedIndex];
        if (selectedOption.value === "") {
            $("#curvaContainer").addClass("oculto");
            return;
        }

        let codigo = selectedOption.value;
        let curva = JSON.parse(selectedOption.getAttribute("data-curva"));
        let colores = JSON.parse(selectedOption.getAttribute("data-colores"));

        $("#codigoSeleccionado").text(codigo);

        let pedidoBody = $("#pedidoBody");
        let headerRow = $("thead tr");

        pedidoBody.html("");
        let headerHTML = "<th>Color / Talle</th>";
        curva.forEach(talle => { headerHTML += "<th>" + talle + "</th>"; });
        headerRow.html(headerHTML);

        colores.forEach(color => {
            let tr = $("<tr>").append($("<td>").text(color));
            curva.forEach(talle => {
                let td = $("<td>").append($("<input>").attr({ type: "number", min: 0, "data-color": color, "data-talle": talle }));
                tr.append(td);
            });
            pedidoBody.append(tr);
        });

        $("#curvaContainer").removeClass("oculto");
    });
});

function agregarPedido() {
    let codigo = $("#codigoSeleccionado").text();
    let pedidosTabla = $("#pedidosTabla tbody");

    $("#pedidoBody input").each(function() {
        let cantidad = parseInt($(this).val());
        let talle = $(this).data("talle");
        let color = $(this).data("color");

        if (cantidad > 0) {
            let fila = $("<tr>").append($("<td>").text(codigo), $("<td>").text(color), $("<td>").text(talle), $("<td>").text(cantidad));
            pedidosTabla.append(fila);
        }
    });

    $("#curvaContainer").addClass("oculto");
    $("#codigoSelect").val("").trigger("change");
}

function descargarCSV() {
    let cliente = $("#clienteSelect").val();
    let fecha = $("#fechaSelect").val();
    if (!cliente || !fecha) {
        alert("Por favor, selecciona un cliente y una fecha.");
        return;
    }

    let csv = `Fecha,Cliente,Artículo,Color,Talle,Cantidad\n${fecha},${cliente}\n`;
    $("#pedidosTabla tbody tr").each(function() {
        let cells = $(this).find('td');
        csv += `${cells.eq(0).text()},${cells.eq(1).text()},${cells.eq(2).text()},${cells.eq(3).text()}\n`;
    });

    let hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.download = `${cliente}_${fecha}_pedidos.csv`;
    hiddenElement.click();
}
