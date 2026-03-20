const { readDB, writeDB } = require('./db');

function send(res, statusCode, payload) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            if (!body) return resolve({});
            try {
                resolve(JSON.parse(body));
            } catch {
                reject(new Error('JSON invalide'));
            }
        });

        req.on('error', reject);
    });
}

async function router(req, res) {
    try {
        const { method, url } = req;

        const [pathname, queryString] = url.split('?');

        if (method === 'GET' && pathname === '/books') {
            const db = await readDB();
            const query = new URLSearchParams(queryString || '');
            const available = query.get('available');

            let books = db.books;
            if (available === 'true') books = db.books.filter((item) => item.available === true);
            if (available === 'false') books = db.books.filter((item) => item.available === false);

            return send(res, 200, {
                success: true,
                count: books.length,
                data: books
            });
        }

        if (method === 'GET' && pathname.startsWith('/books/')) {
            const id = Number(pathname.split('/')[2]);
            const db = await readDB();
            const book = db.books.find((item) => item.id === id);

            if (!book) {
                return send(res, 404, { success: false, error: 'Livre introuvable' });
            }

            return send(res, 200, { success: true, data: book });
        }

        if (method === 'POST' && pathname === '/books') {
            const body = await readBody(req);
            const { title, author, year } = body;

            if (!title || !author || !year) {
                return send(res, 400, {
                    success: false,
                    error: 'Les champs title, author et year sont requis'
                });
            }

            const db = await readDB();
            const maxId = db.books.reduce((max, item) => Math.max(max, item.id), 0);

            const newBook = {
                id: maxId + 1,
                title,
                author,
                year,
                available: true
            };

            db.books.push(newBook);
            await writeDB(db);

            return send(res, 201, { success: true, data: newBook });
        }

        if (method === 'DELETE' && pathname.startsWith('/books/')) {
            const id = Number(pathname.split('/')[2]);
            const db = await readDB();
            const index = db.books.findIndex((item) => item.id === id);

            if (index === -1) {
                return send(res, 404, { success: false, error: 'Livre introuvable' });
            }

            const deleted = db.books[index];
            db.books.splice(index, 1);
            await writeDB(db);

            return send(res, 200, { success: true, data: deleted });
        }

        return send(res, 404, { success: false, error: 'Route non trouvée' });
    } catch {
        return send(res, 500, { success: false, error: 'Erreur interne' });
    }
}

module.exports = { router };
