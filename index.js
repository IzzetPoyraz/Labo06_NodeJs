import http from 'http';
import fs from 'fs';

let status;

try {
  const data = fs.readFileSync('./status', 'utf8');
  status = JSON.parse(data);
} catch (error) {
  console.error('Error reading status file:', error);
  // Als het bestand niet bestaat, ongeldige JSON bevat of de juiste eigenschappen niet heeft, zorg voor een fallback-status
  status = { red: 0, blue: 0 };
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    // Handle pre-flight request
    res.writeHead(200);
    res.end();
  } else if (req.method === 'GET') {
    if (req.url === '/red') {
      res.end(JSON.stringify({ red: status.red }));
    } else if (req.url === '/blue') {
      res.end(JSON.stringify({ blue: status.blue }));
    } else if (req.url === '/status') {
      res.end(JSON.stringify(status));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'page not found' }));
    }
  } else if (req.method === 'PUT') {
    if (req.url === '/red') {
      status.red++;
      res.end(JSON.stringify({ red: status.red }));
    } else if (req.url === '/blue') {
      status.blue++;
      res.end(JSON.stringify({ blue: status.blue }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'page not found' }));
    }

    // Schrijf de bijgewerkte status terug naar het documentbestand
    fs.writeFile('./status', JSON.stringify(status), 'utf8', (error) => {
      if (error) {
        console.error('Error writing status file:', error);
      }
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'page not found' }));
  }
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});


/*De OPTIONS-methode en CORS (Cross-Origin Resource Sharing) hebben met elkaar te maken en zijn beide gerelateerd aan het beveiligen van HTTP-verzoeken tussen verschillende domeinen.

De OPTIONS-methode wordt gebruikt als onderdeel van het CORS-mechanisme. Wanneer een client een cross-origin HTTP-verzoek wil doen (bijvoorbeeld vanaf een website op domein A naar een API op domein B), stuurt de browser eerst een pre-flight request met de OPTIONS-methode naar de server op het doeldomein (domein B). Deze pre-flight request is een controleverzoek om te bepalen of de eigenlijke verzoekmethode (bijv. GET, POST) is toegestaan en welke headers en methoden zijn toegestaan. De server moet dan de juiste headers terugsturen om de client te laten weten welke verzoeken zijn toegestaan.

In het gegeven codevoorbeeld wordt de OPTIONS-methode afgehandeld in de servercallback. Als het ontvangen verzoek een OPTIONS-verzoek is, worden de CORS-headers ingesteld (Access-Control-Allow-Origin, Access-Control-Allow-Methods en Access-Control-Allow-Headers) en wordt de statuscode ingesteld op 200. Er wordt geen inhoud verzonden in het antwoord (res.end()) omdat de OPTIONS-methode wordt gebruikt voor de controle en er geen specifieke inhoud wordt verwacht.

Als het ontvangen verzoek geen OPTIONS-verzoek is, worden dezelfde CORS-headers ingesteld en wordt een JSON-antwoord met de boodschap 'test' teruggestuurd.

Op deze manier wordt de server geconfigureerd om CORS-verzoeken vanaf elk domein toe te staan (door 'Access-Control-Allow-Origin' in te stellen op '*') en om specifiek GET, PUT en OPTIONS-methoden toe te staan (door 'Access-Control-Allow-Methods' in te stellen op 'GET, PUT, OPTIONS'). De server staat ook het 'Content-Type'-header toe (via 'Access-Control-Allow-Headers') en stuurt de 'Content-Type' als 'application/json' in het antwoord. Dit helpt bij het oplossen van potentiële beveiligingsproblemen en maakt het mogelijk voor clients op verschillende domeinen om met de server te communiceren via HTTP-verzoeken.*/ 