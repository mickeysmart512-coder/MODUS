const { micah, avataaars } = require('@dicebear/collection');

console.log('--- MICAH ---');
for (const key of Object.keys(micah.schema.properties)) {
    const prop = micah.schema.properties[key];
    if (prop.items && prop.items.enum) {
        console.log(`${key}:`, prop.items.enum.slice(0, 10), prop.items.enum.length > 10 ? '...' : '');
    } else if (prop.enum) {
        console.log(`${key} (enum):`, prop.enum.slice(0, 10));
    } else {
        console.log(`${key}:`, prop.type);
    }
}

console.log('\n--- AVATAAARS ---');
for (const key of Object.keys(avataaars.schema.properties)) {
    const prop = avataaars.schema.properties[key];
    if (prop.items && prop.items.enum) {
        console.log(`${key}:`, prop.items.enum.slice(0, 10), prop.items.enum.length > 10 ? '...' : '');
    } else if (prop.enum) {
        console.log(`${key} (enum):`, prop.enum.slice(0, 10));
    } else {
        console.log(`${key}:`, prop.type);
    }
}
