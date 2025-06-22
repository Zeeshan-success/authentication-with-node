const HandleCreateUser = (req, res) => {
    res.json({
        message: 'User created successfully',
        user: {
            id: 1,
            name: 'Jane Doe',
        },
    });
}

module.exports ={ HandleCreateUser}