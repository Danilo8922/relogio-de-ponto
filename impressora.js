const escpos = require('escpos');
escpos.USB = require('escpos-usb');

// Substitua aqui com seus Vendor/Product ID
const device = new escpos.USB(0x3036, 0x0001); 

function imprimirComprovante(nome, data, hora) {
  const printer = new escpos.Printer(device);

  device.open(function(err) {
    if (err) {
      return console.error("Erro ao abrir a impressora:", err);
    }

    printer
      .align('ct')
      .style('b')
      .size(1, 1)
      .text('COMPROVANTE DE PONTO')
      .text('-----------------------------')
      .align('lt')
      .text(`Nome: ${nome}`)
      .text(`Data: ${data}`)
      .text(`Hora: ${hora}`)
      .text('-----------------------------')
      .feed(2)
      .cut()
      .close();
  });
}

module.exports = { imprimirComprovante };
