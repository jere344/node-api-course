

# 1) POST /api/auth/register
curl -i -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"nom":"hello","email":"hello@example.com","password":"worldworld"}'

# 2) POST /api/auth/login (user)
USER_LOGIN=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"hello@example.com","password":"worldworld"}')
echo "$USER_LOGIN"
USER_TOKEN=$(echo "$USER_LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
echo "USER_TOKEN=$USER_TOKEN"

# 3) GET /api/auth/me (auth user)
curl -i "http://localhost:3000/api/auth/me" \
  -H "Authorization: Bearer $USER_TOKEN"

# 4) GET /api/livres
curl -i "http://localhost:3000/api/livres"

# 5) GET /api/livres/:id
curl -i "http://localhost:3000/api/livres/1"

# 6) POST /api/livres (auth user)
NEW_BOOK=$(curl -s -X POST "http://localhost:3000/api/livres" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"titre":"Livre Test","auteur":"Auteur Test","genre":"Informatique"}')
echo "$NEW_BOOK"
BOOK_ID=$(echo "$NEW_BOOK" | sed -n 's/.*"id":\([0-9][0-9]*\).*/\1/p')
echo "BOOK_ID=$BOOK_ID"

# 7) PUT /api/livres/:id (auth user)
curl -i -X PUT "http://localhost:3000/api/livres/$BOOK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"genre":"Roman"}'

# 8) DELETE /api/livres/:id (auth admin)
# Test d'abord avec user => doit renvoyer 403
curl -i -X DELETE "http://localhost:3000/api/livres/$BOOK_ID" \
  -H "Authorization: Bearer $USER_TOKEN"

# Connexion admin (seedé: admin@biblio.dev / Admin1234)
ADMIN_LOGIN=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@biblio.dev","password":"Admin1234"}')
echo "$ADMIN_LOGIN"
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
echo "ADMIN_TOKEN=$ADMIN_TOKEN"

# DELETE avec admin => doit renvoyer 204
curl -i -X DELETE "http://localhost:3000/api/livres/$BOOK_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Recréer un livre pour les tests emprunt/retour
BORROW_BOOK=$(curl -s -X POST "http://localhost:3000/api/livres" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"titre":"Livre Emprunt","auteur":"Auteur Emprunt"}')
BORROW_BOOK_ID=$(echo "$BORROW_BOOK" | sed -n 's/.*"id":\([0-9][0-9]*\).*/\1/p')
echo "BORROW_BOOK_ID=$BORROW_BOOK_ID"

# 9) POST /api/livres/:id/emprunter (auth user)
curl -i -X POST "http://localhost:3000/api/livres/$BORROW_BOOK_ID/emprunter" \
  -H "Authorization: Bearer $USER_TOKEN"

# Refaire emprunter => doit renvoyer 409
curl -i -X POST "http://localhost:3000/api/livres/$BORROW_BOOK_ID/emprunter" \
  -H "Authorization: Bearer $USER_TOKEN"

# 10) POST /api/livres/:id/retourner (auth user)
curl -i -X POST "http://localhost:3000/api/livres/$BORROW_BOOK_ID/retourner" \
  -H "Authorization: Bearer $USER_TOKEN"