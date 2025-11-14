const mongoose = require('mongoose');

const rolePermissionsSchema = new mongoose.Schema({
    guildId: { type: String, unique: true, required: true },
    guildName: { type: String, required: true },
    moderatorRoleId: { type: String, default: null },
    moderatorRoleName: { type: String, default: null },
    immuneRoleId: { type: String, default: null },
    immuneRoleName: { type: String, default: null },
}, { timestamps: true });

const RolePermissionsModel = mongoose.model('rolePermissions', rolePermissionsSchema);

module.exports = RolePermissionsModel;
