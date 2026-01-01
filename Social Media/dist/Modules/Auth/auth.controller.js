"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_services_1 = __importDefault(require("./auth.services"));
const validation_middleware_1 = require("../../Middleware/validation.middleware");
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)();
router.post("/signup", (0, validation_middleware_1.validation)(auth_validation_1.signUpSchema), auth_services_1.default.signup);
router.post("/login", auth_services_1.default.login);
router.patch("/confirm-email", (0, validation_middleware_1.validation)(auth_validation_1.confirmEmailSchema), auth_services_1.default.confirmEmail);
exports.default = router;
