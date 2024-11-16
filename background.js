// Load the required scripts
importScripts(
    "/lib/webxBackground.js",
    "/js/background/main_background_module.js",
    "/js/background/sf_api_manager.js"
);

// Modified x.util.load_resources function to avoid jQuery
self[self.webextension_library_name].util.load_resources = function (resource_data_arr) {
    return new Promise((resolve, reject) => {
        let resource_hash = {};
        let loaded_resource_count = 0;

        resource_data_arr.forEach((resource_data) => {
            const [name, type, url] = resource_data;
            const resource_url = url.startsWith("local") ? chrome.runtime.getURL(url.replace("local", "")) : url;

            fetch(resource_url)
                .then(response => {
                    if (!response.ok) throw new Error(`Failed to load ${url}`);
                    return type === "json" ? response.json() : response.text();
                })
                .then(data => {
                    resource_hash[name] = data;
                    loaded_resource_count += 1;

                    if (loaded_resource_count === resource_data_arr.length) {
                        resolve(resource_hash);
                    }
                })
                .catch((error) => {
                    console.error(`Error loading resource ${name}:`, error);
                    reject(error);
                });
        });
    });
};

// Original code for initialization
(function (x) {
    x.util.load_resources([
        ["config", "json", "/config.json"]
    ]).then((resources) => {
        const config = resources["config"];
        const app = self.app = {
            name: "background",
            x: x,
            log: x.log,
            hub: new x.hub(config.mode),
            config: config,
            resources: resources
        };

        x.log.init(app);
        x.report_manager_hub.init(app.config);

        x.conv.set_options({
            mode: resources.config.mode,
            debug: false,
            silence: []
        });

        app.sf_api_manager = sf_api_manager();
        app.main_background_module = main_background_module();

        app.sf_api_manager.init(app);
        app.main_background_module.init(app);

        app.x.bg_api.init();
        app.x.bg_api.register("main", app.main_background_module);
    }).catch((error) => console.error("Failed to load resources:", error));
})(self[self.webextension_library_name]);
