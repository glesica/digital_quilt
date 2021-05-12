WWW_PTH := /var/www/html/
SCP_SRC := site/*
SCP_DST := root@quilt.lesica.com
SSH_OPT := -i ~/.ssh/id_rsa_digitalocean

STATIC_ASSETS := web_app/*.html web_app/*.css web_app/*.js web_app/*.js.map

SCP_SRC_LIGHT := site/*.html site/*.css site/*.js site/*.js.map site/logos

.PHONY: build
build:
	cd web_app && tsc
	rm -rf site
	mkdir site
	cp $(STATIC_ASSETS) site/
	mkdir site/quilt_data
	cp quilt_data/* site/quilt_data/
	mkdir site/logos
	cp logos/* site/logos/

.PHONY: deploy
deploy: build
	ssh $(SSH_OPT) $(SCP_DST) "rm -rf /var/www/html/"
	ssh $(SSH_OPT) $(SCP_DST) "mkdir -p /var/www/html"
	scp $(SSH_OPT) -r $(SCP_SRC) $(SCP_DST):$(WWW_PTH)

.PHONY: light-deploy
light-deploy: build
	scp $(SSH_OPT) -r $(SCP_SRC_LIGHT) $(SCP_DST):$(WWW_PTH)

.PHONY: serve
serve:
	@echo "Serving on port 8080, ctrl-c to quit"
	python3 -m http.server 8080

.PHONY: setup
setup:
	cd digital_quilt && pipenv install
	cd web_app && npm install

