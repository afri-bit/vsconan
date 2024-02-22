
module.exports = {
    roots: ['./test'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: './tsconfig.json'
        }],
    },
    testRegex: '\\.test\\.ts$',
    moduleFileExtensions: ['ts', 'js'],
    collectCoverageFrom: [
        'src/**/*.ts'
    ]
};