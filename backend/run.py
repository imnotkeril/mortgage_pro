import argparse
import os
import sys

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Mortgage Calculator Pro')
    parser.add_argument('--mode', choices=['api', 'streamlit'], default='api',
                        help='Run mode: API for React or Streamlit UI')
    
    args = parser.parse_args()
    
    if args.mode == 'api':
        # Run Flask API
        from app import create_app
        app = create_app()
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        # If Streamlit is installed, run the streamlit app
        try:
            import streamlit
            os.system(f"{sys.executable} -m streamlit run streamlit_app.py")
        except ImportError:
            print("Streamlit is not installed. Please install it with:")
            print("pip install streamlit")
            sys.exit(1)