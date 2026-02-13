// Simple TCP printer simulator that prints incoming bytes to console and appends to printer.log
const net = require('net');
const fs = require('fs');
const PORT = process.env.PORT || 9100;

const server = net.createServer(socket => {
  const addr = socket.remoteAddress + ':' + socket.remotePort;
  console.log('Printer connected from', addr);
  let chunks = [];
  socket.on('data', data => {
    chunks.push(data);
  });
  socket.on('end', ()=>{
    const buf = Buffer.concat(chunks);
    const txt = buf.toString('binary');
    const now = new Date().toISOString();
    const log = `--- ${now} from ${addr} ---\n${txt}\n\n`;
    console.log(log);
    fs.appendFileSync('printer.log', log, 'utf8');
  });
  socket.on('error', err => console.error('Socket error', err.message));
});

server.listen(PORT, ()=>console.log(`Printer simulator listening on port ${PORT}`));
