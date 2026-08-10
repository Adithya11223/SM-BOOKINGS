import os
import re

HOOKS_MAPPING = {
    'appMode': 'useAppConfig',
    'setAppMode': 'useAppConfig',
    'businessSettings': 'useAppConfig',
    'updateBusinessSettings': 'useAppConfig',
    'allServices': 'useServices',
    'addService': 'useServices',
    'updateService': 'useServices',
    'deleteService': 'useServices',
    'toggleServiceVisibility': 'useServices',
    'cart': 'useCart',
    'addToCart': 'useCart',
    'removeFromCart': 'useCart',
    'updateQuantity': 'useCart',
    'clearCart': 'useCart',
    'cartTotal': 'useCart',
    'cartDuration': 'useCart',
    'cartItemCount': 'useCart',
    'bookings': 'useBookings',
    'addBooking': 'useBookings',
    'updateBookingStatus': 'useBookings',
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if 'useApp()' not in content:
        return

    # Find the line: const { ... } = useApp();
    match = re.search(r'const\s+\{\s*([^}]+)\s*\}\s*=\s*useApp\(\);', content)
    if not match:
        return

    destructured_vars = [v.strip() for v in match.group(1).split(',')]
    
    # Group variables by hook
    hooks_needed = {}
    for var in destructured_vars:
        if not var: continue
        hook = HOOKS_MAPPING.get(var)
        if hook:
            if hook not in hooks_needed:
                hooks_needed[hook] = []
            hooks_needed[hook].append(var)

    # Generate replacement lines
    replacement_lines = []
    for hook, vars in hooks_needed.items():
        replacement_lines.append(f"const {{ {', '.join(vars)} }} = {hook}();")

    replacement_str = '\n  '.join(replacement_lines)
    content = content.replace(match.group(0), replacement_str)

    # Fix imports
    # Remove useApp import
    content = re.sub(r'import\s+\{([^}]*)useApp([^}]*)\}\s+from\s+[\'"].*?AppProvider[\'"];?\n?', '', content)
    
    # Determine correct import path based on depth
    depth = filepath.count('/') - 6 # src is at depth 6: /Users/adithya/Developer/SM_SALOON/src/...
    import_prefix = '../' * depth if depth > 0 else './'
    if 'screens' in filepath:
        if 'admin' in filepath or 'booking' in filepath:
            import_prefix = '../../hooks/'
        else:
            import_prefix = '../hooks/'

    hooks_import = f"import {{ {', '.join(hooks_needed.keys())} }} from '{import_prefix}';"
    
    # Add hooks import after react import
    content = re.sub(r'(import React.*?from [\'"]react[\'"];?)', r'\1\n' + hooks_import, content)

    with open(filepath, 'w') as f:
        f.write(content)

def main():
    src_dir = '/Users/adithya/Developer/SM_SALOON/src'
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
