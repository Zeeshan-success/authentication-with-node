const HandleLogin = async (req, res) => {
    res.json({
        message: 'Login successful',
        user: {
            id: 1,
            name: 'John Doe',
        },
    });
};

module.exports = { HandleLogin };