BASE="http://localhost:3000"
EMAIL="user$(date +%s)@example.com"
COOKIE_FILE=$(mktemp)

# 1) POST /api/auth/register => 201
REGISTER=$(curl -s -o /tmp/day3_register.json -w "%{http_code}" -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"nom\":\"hello\",\"email\":\"$EMAIL\",\"password\":\"worldworld\"}" \
  -c "$COOKIE_FILE")
echo "REGISTER=$REGISTER"
cat /tmp/day3_register.json

# 2) POST /api/auth/login => 200
LOGIN=$(curl -s -o /tmp/day3_login.json -w "%{http_code}" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"worldworld\"}" \
  -c "$COOKIE_FILE")
echo "LOGIN=$LOGIN"
cat /tmp/day3_login.json
USER_TOKEN=$(sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p' /tmp/day3_login.json)
echo "USER_TOKEN=$USER_TOKEN"

# 3) POST /api/auth/refresh => 200
REFRESH=$(curl -s -o /tmp/day3_refresh.json -w "%{http_code}" -X POST "$BASE/api/auth/refresh" \
  -b "$COOKIE_FILE")
echo "REFRESH=$REFRESH"
cat /tmp/day3_refresh.json

# 4) GET /api/auth/me (auth user) => 200
ME=$(curl -s -o /tmp/day3_me.json -w "%{http_code}" "$BASE/api/auth/me" \
  -H "Authorization: Bearer $USER_TOKEN")
echo "ME=$ME"
cat /tmp/day3_me.json

# 5) GET /api/livres => 200
LIVRES=$(curl -s -o /tmp/day3_livres.json -w "%{http_code}" "$BASE/api/livres")
echo "LIVRES=$LIVRES"

# 6) GET /api/livres/:id => 200
LIVRE_1=$(curl -s -o /tmp/day3_livre1.json -w "%{http_code}" "$BASE/api/livres/1")
echo "LIVRE_1=$LIVRE_1"

# 7) POST /api/livres (auth user) => 201
NEW_BOOK_STATUS=$(curl -s -o /tmp/day3_new_book.json -w "%{http_code}" -X POST "$BASE/api/livres" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"titre":"Livre Test","auteur":"Auteur Test","genre":"Informatique"}')
echo "NEW_BOOK_STATUS=$NEW_BOOK_STATUS"
BOOK_ID=$(sed -n 's/.*"id":\([0-9][0-9]*\).*/\1/p' /tmp/day3_new_book.json)
echo "BOOK_ID=$BOOK_ID"

# 8) PUT /api/livres/:id (auth user) => 200
UPDATE_STATUS=$(curl -s -o /tmp/day3_update_book.json -w "%{http_code}" -X PUT "$BASE/api/livres/$BOOK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"genre":"Roman"}')
echo "UPDATE_STATUS=$UPDATE_STATUS"

# 9) DELETE /api/livres/:id avec user => 403
DELETE_USER_STATUS=$(curl -s -o /tmp/day3_delete_user.json -w "%{http_code}" -X DELETE "$BASE/api/livres/$BOOK_ID" \
  -H "Authorization: Bearer $USER_TOKEN")
echo "DELETE_USER_STATUS=$DELETE_USER_STATUS"

# 10) LOGIN admin + DELETE /api/livres/:id avec admin => 200 puis 204
ADMIN_LOGIN=$(curl -s -o /tmp/day3_admin_login.json -w "%{http_code}" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@biblio.dev","password":"Admin1234"}')
echo "ADMIN_LOGIN=$ADMIN_LOGIN"
ADMIN_TOKEN=$(sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p' /tmp/day3_admin_login.json)
echo "ADMIN_TOKEN=$ADMIN_TOKEN"
DELETE_ADMIN_STATUS=$(curl -s -o /tmp/day3_delete_admin.json -w "%{http_code}" -X DELETE "$BASE/api/livres/$BOOK_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "DELETE_ADMIN_STATUS=$DELETE_ADMIN_STATUS"

# 11) Emprunter / Retourner
BORROW_BOOK_STATUS=$(curl -s -o /tmp/day3_borrow_book.json -w "%{http_code}" -X POST "$BASE/api/livres" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"titre":"Livre Emprunt","auteur":"Auteur Emprunt"}')
echo "BORROW_BOOK_STATUS=$BORROW_BOOK_STATUS"
BORROW_BOOK_ID=$(sed -n 's/.*"id":\([0-9][0-9]*\).*/\1/p' /tmp/day3_borrow_book.json)
echo "BORROW_BOOK_ID=$BORROW_BOOK_ID"

EMPRUNT_STATUS=$(curl -s -o /tmp/day3_emprunt.json -w "%{http_code}" -X POST "$BASE/api/livres/$BORROW_BOOK_ID/emprunter" \
  -H "Authorization: Bearer $USER_TOKEN")
echo "EMPRUNT_STATUS=$EMPRUNT_STATUS"

EMPRUNT_AGAIN_STATUS=$(curl -s -o /tmp/day3_emprunt_again.json -w "%{http_code}" -X POST "$BASE/api/livres/$BORROW_BOOK_ID/emprunter" \
  -H "Authorization: Bearer $USER_TOKEN")
echo "EMPRUNT_AGAIN_STATUS=$EMPRUNT_AGAIN_STATUS"

RETOUR_STATUS=$(curl -s -o /tmp/day3_retour.json -w "%{http_code}" -X POST "$BASE/api/livres/$BORROW_BOOK_ID/retourner" \
  -H "Authorization: Bearer $USER_TOKEN")
echo "RETOUR_STATUS=$RETOUR_STATUS"

# 12) POST /api/auth/logout => 200
LOGOUT=$(curl -s -o /tmp/day3_logout.json -w "%{http_code}" -X POST "$BASE/api/auth/logout" \
  -b "$COOKIE_FILE" -c "$COOKIE_FILE")
echo "LOGOUT=$LOGOUT"