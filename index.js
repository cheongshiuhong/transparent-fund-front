try {
    throw Error('Error');
} finally {
    console.log('Finally called');
}
