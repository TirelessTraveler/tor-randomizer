from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Import your converted scripts
import group_restrictions
import randomizer
import role_categories
import rolelist_presets

@app.route('/roll', methods=['POST'])
def roll():
    data = request.get_json()
    # Assuming the process method in randomizer takes the data dictionary and returns results
    results = randomizer.main(data)
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
