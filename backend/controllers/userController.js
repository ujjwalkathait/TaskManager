const Task = require("../models/Tasks");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc    Get all users(Admin only)
// @route   GET /api/users
// @access  Private(Requires JWT) (Admin)

const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'member' }).select('-password'); // Exclude password from user data
        const usersWithTaskCounts = await Promise.all(users.map(async (user) => {
            const pendingTasks = await Task.countDocuments({ assignedTo: user._id, status: 'Pending' });
            const inProgressTasks = await Task.countDocuments({ assignedTo: user._id, status: 'In Progress' });
            const completedTasks = await Task.countDocuments({ assignedTo: user._id, status: 'Completed' });
            return {
                ...user._doc,
                pendingTasks,
                inProgressTasks,
                completedTasks,
            };
        }));
        res.json(usersWithTaskCounts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private(Requires JWT)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {// Check if user exists
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete user by ID (Admin only)
// @route   DELETE /api/users/:id
// @access  Private(Requires JWT) (Admin)
// const deleteUser = async (req, res) => {
//     try {

//     } catch (error) {
//         res.status(500).json({ message: 'Server Error', error: error.message });
//     }
// };

module.exports = {
    getUsers,
    getUserById,
};