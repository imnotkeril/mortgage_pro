import argparse
import os
import sys

# Add the parent directory of backend to Python path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(parent_dir)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Mortgage Calculator Pro')
    parser.add_argument('--mode', choices=['api', 'streamlit'], default='api',
                        help='Run mode: API for React or Streamlit UI')

    args = parser.parse_args()

    if args.mode == 'api':
        # Use absolute import path
        from backend.api.app import create_app

        app = create_app()
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        try:
            import streamlit

            os.system(f"{sys.executable} -m streamlit run streamlit_app.py")
        except ImportError:
            print("Streamlit is not installed. Please install it with:")
            print("pip install streamlit")
            sys.exit(1)