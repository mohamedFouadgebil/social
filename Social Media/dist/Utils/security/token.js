"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRevokeToken = exports.decodedToken = exports.createLoginCredentials = exports.getSingature = exports.getSignatureLevel = exports.verifyToken = exports.generateToken = exports.LogoutEnum = exports.TokenTypeEnum = exports.SignatureLevelEnum = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const user_model_1 = require("../../DB/Models/user.model");
const uuid_1 = require("uuid");
const error_response_1 = require("../response/error.response");
const user_repository_1 = require("../../DB/repository/user.repository");
const token_model_1 = require("../../DB/Models/token.model");
const token_repository_1 = require("../../DB/repository/token.repository");
var SignatureLevelEnum;
(function (SignatureLevelEnum) {
    SignatureLevelEnum["USER"] = "USER";
    SignatureLevelEnum["ADMIN"] = "ADMIN";
})(SignatureLevelEnum || (exports.SignatureLevelEnum = SignatureLevelEnum = {}));
var TokenTypeEnum;
(function (TokenTypeEnum) {
    TokenTypeEnum["ACCESS"] = "ACCESS";
    TokenTypeEnum["REFRESH"] = "REFRESH";
})(TokenTypeEnum || (exports.TokenTypeEnum = TokenTypeEnum = {}));
var LogoutEnum;
(function (LogoutEnum) {
    LogoutEnum["ONLY"] = "ONLY";
    LogoutEnum["ALL"] = "ALL";
})(LogoutEnum || (exports.LogoutEnum = LogoutEnum = {}));
const generateToken = async ({ payload, secret, options, }) => {
    return await (0, jsonwebtoken_1.sign)(payload, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = async ({ token, secret, }) => {
    return (await (0, jsonwebtoken_1.verify)(token, secret));
};
exports.verifyToken = verifyToken;
const getSignatureLevel = async (role = user_model_1.RoleEnum.USER) => {
    let signatureLevel = SignatureLevelEnum.USER;
    switch (role) {
        case user_model_1.RoleEnum.ADMIN:
            signatureLevel = SignatureLevelEnum.ADMIN;
            break;
        case user_model_1.RoleEnum.USER:
            signatureLevel = SignatureLevelEnum.USER;
            break;
        default:
            break;
    }
    return signatureLevel;
};
exports.getSignatureLevel = getSignatureLevel;
const getSingature = async (signatureLevel = SignatureLevelEnum.USER) => {
    let signatures = {
        access_token: "",
        refresh_token: "",
    };
    switch (signatureLevel) {
        case SignatureLevelEnum.ADMIN:
            signatures.access_token = process.env.ACCESS_ADMIN_TOKEN_SECRET;
            signatures.refresh_token = process.env
                .REFRESH_ADMIN_TOKEN_SECRET;
            break;
        case SignatureLevelEnum.USER:
            signatures.access_token = process.env.ACCESS_USER_TOKEN_SECRET;
            signatures.refresh_token = process.env
                .REFRESH_USER_TOKEN_SECRET;
            break;
        default:
            break;
    }
    return signatures;
};
exports.getSingature = getSingature;
const createLoginCredentials = async (user) => {
    const signatureLevel = await (0, exports.getSignatureLevel)(user.role);
    const signatures = await (0, exports.getSingature)(signatureLevel);
    const jwtid = (0, uuid_1.v4)();
    const access_token = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signatures.access_token,
        options: {
            expiresIn: Number(process.env.ACCESS_EXPIRES_IN),
            jwtid,
        },
    });
    const refersh_token = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signatures.refresh_token,
        options: {
            expiresIn: Number(process.env.REFRESH_EXPIRES_IN),
            jwtid,
        },
    });
    return { access_token, refersh_token };
};
exports.createLoginCredentials = createLoginCredentials;
const decodedToken = async ({ authorization, tokenType = TokenTypeEnum.ACCESS, }) => {
    const userModel = new user_repository_1.UserRepository(user_model_1.UserModel);
    const tokenModel = new user_repository_1.UserRepository(token_model_1.TokenModel);
    const [bearer, token] = authorization.split(" ");
    if (!bearer || !token)
        throw new error_response_1.UnAuthorizedException("Missing Token Parts");
    const signatures = await (0, exports.getSingature)(bearer);
    const decoded = await (0, exports.verifyToken)({
        token,
        secret: tokenType === TokenTypeEnum.REFRESH
            ? signatures.refresh_token
            : signatures.access_token,
    });
    if (!decoded?._id || !decoded.iat) {
        throw new error_response_1.UnAuthorizedException("Invalid Token Payload");
    }
    if (await tokenModel.findOne({ filter: { jti: decoded.jti } })) {
        throw new error_response_1.NotFoundException("Invalid or old login credentials");
    }
    const user = await userModel.findOne({ filter: { _id: decoded._id } });
    if (!user)
        throw new error_response_1.NotFoundException("User Not Found");
    if ((user.changeCredientialsTime?.getTime() || 0) > decoded.iat * 1000) {
        throw new error_response_1.UnAuthorizedException("Loggedout From All Devices");
    }
    return { user, decoded };
};
exports.decodedToken = decodedToken;
const createRevokeToken = async (decoded) => {
    const tokenModel = new token_repository_1.TokenRepository(token_model_1.TokenModel);
    const [results] = (await tokenModel.create({
        data: [
            {
                jti: decoded.jti,
                expiresIn: decoded.iat,
                userId: decoded._id,
            },
        ],
    })) || [];
    if (!results)
        throw new error_response_1.BadRequestException("Fail to revoke token");
    return results;
};
exports.createRevokeToken = createRevokeToken;
