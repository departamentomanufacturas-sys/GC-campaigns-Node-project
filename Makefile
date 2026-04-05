.PHONY: debug stop test push clean

BASE_URL = http://localhost:3000

debug:
	@npm install --prefer-offline --no-audit --no-fund
	@echo ""
	@echo "Microservice starting at $(BASE_URL)"
	node ./src/index.js

stop:
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process on port 3000"


test:
	@lsof -ti:3001 | xargs kill -9 2>/dev/null || true
	npm test

push:
	GIT_SSH_COMMAND="ssh -F ~/.ssh/ssh_config" git push -u origin $$(git branch --show-current)

clean:
	rm -rf node_modules
