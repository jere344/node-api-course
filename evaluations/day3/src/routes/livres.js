const express = require("express");
const livreController = require("../controllers/livresController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const { livreCreateSchema, livreUpdateSchema } = require("../validators/livreValidator");

const router = express.Router();

router.get("/", livreController.index);
router.get("/:id", livreController.show);

/**
 * @swagger
 * /api/livres:
 *   post:
 *     summary: Creer un livre
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Livre cree
 *       401:
 *         description: Non authentifie
 */
router.post("/", authenticate, validate(livreCreateSchema), livreController.create);
router.put("/:id", authenticate, validate(livreUpdateSchema), livreController.update);

/**
 * @swagger
 * /api/livres/{id}:
 *   delete:
 *     summary: Supprimer un livre (admin)
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Supprime
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Acces refuse
 */
router.delete("/:id", authenticate, authorize("admin"), livreController.destroy);
router.post("/:id/emprunter", authenticate, livreController.emprunter);
router.post("/:id/retourner", authenticate, livreController.retourner);

module.exports = router;
