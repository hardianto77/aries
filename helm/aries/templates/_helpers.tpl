



{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "aries.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}


{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "aries.fullname" -}}
{{- if $.Values.fullnameOverride }}
{{- $.Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "aries.labels" -}}
{{- include "aries.standardLabels" (dict "root" . "selectorLabels" (include "aries.selectorLabels" .)) }}
{{- end }}

{{/*
Standard labels for chart-managed workloads.
*/}}
{{- define "aries.standardLabels" -}}
{{- $root := .root -}}
helm.sh/chart: {{ include "aries.chart" $root }}
{{ .selectorLabels }}
{{- if $root.Chart.AppVersion }}
app.kubernetes.io/version: {{ $root.Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ $root.Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "aries.selectorLabels" -}}
app.kubernetes.io/name: {{ include "aries.fullname" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Langfuse fanout collector service name.
*/}}
{{- define "aries.langfuseFanout.fullname" -}}
{{- printf "%s-langfuse-fanout" (include "aries.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Langfuse fanout collector selector labels.
*/}}
{{- define "aries.langfuseFanout.selectorLabels" -}}
app.kubernetes.io/name: {{ include "aries.langfuseFanout.fullname" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Langfuse fanout collector labels.
*/}}
{{- define "aries.langfuseFanout.labels" -}}
{{- include "aries.standardLabels" (dict "root" . "selectorLabels" (include "aries.langfuseFanout.selectorLabels" .)) }}
{{- end }}

{{/*
Validate Langfuse fanout destination keys. Aries normalizes destination
keys to lowercase before putting them on trace attributes, so Helm values must
already use the same lowercase key shape for collector routing to match.
*/}}
{{- define "aries.langfuseFanout.validateDestinationKey" -}}
{{- $name := printf "%v" . -}}
{{- if not (regexMatch "^[a-z][a-z0-9_-]*$" $name) -}}
{{- fail (printf "langfuseFanout.tenant.destinations key %q is invalid; use lowercase keys matching ^[a-z][a-z0-9_-]*$ so Aries trace attributes match collector routes" $name) -}}
{{- end -}}
{{- end }}

{{/*
Render the environment variable name used by the collector for a destination.
*/}}
{{- define "aries.langfuseFanout.destinationBaseUrlEnvName" -}}
{{- printf "LANGFUSE_FANOUT_TENANT_%s_BASE_URL" (. | printf "%v" | upper | replace "-" "_") -}}
{{- end }}

{{/*
Validate the full destination key set. Destination keys can contain hyphens and
underscores, but the collector base URL env vars replace hyphens with
underscores. Reject keys such as foo-bar and foo_bar because they would render
the same LANGFUSE_FANOUT_TENANT_FOO_BAR_BASE_URL env var.
*/}}
{{- define "aries.langfuseFanout.validateDestinationKeys" -}}
{{- $seenEnvNames := dict -}}
{{- range $name, $_destination := .Values.langfuseFanout.tenant.destinations -}}
{{- include "aries.langfuseFanout.validateDestinationKey" $name -}}
{{- $envName := include "aries.langfuseFanout.destinationBaseUrlEnvName" $name -}}
{{- if hasKey $seenEnvNames $envName -}}
{{- fail (printf "langfuseFanout.tenant.destinations keys %q and %q both render %s; use destination keys that remain unique after uppercasing and replacing '-' with '_' for env vars" (get $seenEnvNames $envName) $name $envName) -}}
{{- end -}}
{{- $_ := set $seenEnvNames $envName $name -}}
{{- end -}}
{{- end }}

{{/*
Render the fanout destination list consumed by Aries and the fanout gateway.
*/}}
{{- define "aries.langfuseFanout.tenantDestinationsEnv" -}}
{{- include "aries.langfuseFanout.validateDestinationKeys" . -}}
{{- $tenantDestinations := list -}}
{{- range $name, $destination := .Values.langfuseFanout.tenant.destinations -}}
{{- $tenantDestinations = append $tenantDestinations (printf "%s=%s" $name $destination.baseUrl) -}}
{{- end -}}
{{- join "," $tenantDestinations -}}
{{- end }}

{{/*
Render the fanout destination key list consumed by the gateway as a startup
guard against media destinations the collector cannot route traces to.
*/}}
{{- define "aries.langfuseFanout.tenantDestinationKeysEnv" -}}
{{- include "aries.langfuseFanout.validateDestinationKeys" . -}}
{{- $tenantDestinationKeys := list -}}
{{- range $name, $_destination := .Values.langfuseFanout.tenant.destinations -}}
{{- $tenantDestinationKeys = append $tenantDestinationKeys $name -}}
{{- end -}}
{{- join "," $tenantDestinationKeys -}}
{{- end }}

{{/*
Bundled Redis URI used when the Redis subchart is enabled.
*/}}
{{- define "aries.bundledRedisURI" -}}
{{- printf "redis://%s-master.%s.svc.cluster.local:6379" (include "common.names.fullname" .Subcharts.redis) (.Release.Namespace | lower) -}}
{{- end }}

{{/*
Whether global.aries.env already defines an env var. Args: dict "root" . "name" NAME.
*/}}
{{- define "aries.userEnvHas" -}}
{{- range .root.Values.global.aries.env -}}
{{- if eq .name $.name -}}true{{- end -}}
{{- end -}}
{{- end }}

{{/*
Whether the chart wires Aries to the bundled MongoDB with generated credentials.
Skipped when the operator supplies MONGO_URI (configEnv or global.aries.env),
turns subchart auth off, or sets aries.injectBundledCredentials.mongodb=false (needed when
MONGO_URI comes from the Secret named by global.aries.existingSecretName, which
the chart cannot inspect).
*/}}
{{- define "aries.bundledMongoAuth" -}}
{{- if and .Values.mongodb.enabled .Values.mongodb.auth.enabled (ne (toString (default dict .Values.aries.injectBundledCredentials).mongodb) "false") (not (get (default dict .Values.aries.configEnv) "MONGO_URI")) (not (include "aries.userEnvHas" (dict "root" . "name" "MONGO_URI"))) -}}
true
{{- end -}}
{{- end }}

{{/*
Whether the chart wires Aries to the bundled Redis with its generated password.
Same opt-outs as the MongoDB helper (aries.injectBundledCredentials.redis), for REDIS_URI and REDIS_PASSWORD.
*/}}
{{- define "aries.bundledRedisAuth" -}}
{{- if and .Values.redis.enabled .Values.redis.auth.enabled (ne (toString (default dict .Values.aries.injectBundledCredentials).redis) "false") (not (get (default dict .Values.aries.configEnv) "REDIS_URI")) (not (get (default dict .Values.aries.configEnv) "REDIS_PASSWORD")) (not (include "aries.userEnvHas" (dict "root" . "name" "REDIS_URI"))) (not (include "aries.userEnvHas" (dict "root" . "name" "REDIS_PASSWORD"))) -}}
true
{{- end -}}
{{- end }}

{{/*
Literal value an operator supplied for an env var through aries.configEnv or a
global.aries.env entry with a value. Empty when absent or sourced from a Secret.
Args: dict "root" . "name" NAME.
*/}}
{{- define "aries.suppliedEnvValue" -}}
{{- $v := toString (default "" (get (default dict .root.Values.aries.configEnv) .name)) -}}
{{- range .root.Values.global.aries.env -}}
{{- if eq .name $.name -}}{{- $v = toString (default "" .value) -}}{{- end -}}
{{- end -}}
{{- $v -}}
{{- end }}

{{/*
Fail when the operator supplies REDIS_PASSWORD (or MONGODB_ROOT_PASSWORD) but Aries still
connects to the bundled authenticated database without the subchart knowing that password. Either set redis.auth.password
or redis.auth.existingSecret, point REDIS_URI at another server, or opt out with
aries.injectBundledCredentials.redis=false.
*/}}
{{- define "aries.validateBundledPasswords" -}}
{{- $suppliedPassword := or (get (default dict .Values.aries.configEnv) "REDIS_PASSWORD") (include "aries.userEnvHas" (dict "root" . "name" "REDIS_PASSWORD")) -}}
{{- $suppliedURI := or (get (default dict .Values.aries.configEnv) "REDIS_URI") (include "aries.userEnvHas" (dict "root" . "name" "REDIS_URI")) -}}
{{- if and .Values.redis.enabled .Values.redis.auth.enabled $suppliedPassword (not $suppliedURI) (ne (toString (default dict .Values.aries.injectBundledCredentials).redis) "false") (not .Values.redis.auth.password) (not .Values.redis.auth.existingSecret) -}}
{{- fail "REDIS_PASSWORD is set for Aries but the bundled Redis generates its own password. Set redis.auth.password (or redis.auth.existingSecret) to the same value, set REDIS_URI to your own server, or set aries.injectBundledCredentials.redis=false." -}}
{{- end -}}
{{- if and (include "aries.bundledMongoAuth" .) (or (get (default dict .Values.aries.configEnv) "MONGODB_ROOT_PASSWORD") (include "aries.userEnvHas" (dict "root" . "name" "MONGODB_ROOT_PASSWORD"))) (not .Values.mongodb.auth.rootPassword) (not .Values.mongodb.auth.existingSecret) -}}
{{- fail "MONGODB_ROOT_PASSWORD is set for Aries but the bundled MongoDB generates its own password. Set mongodb.auth.rootPassword (or mongodb.auth.existingSecret) to the same value, set MONGO_URI to your own server, or set aries.injectBundledCredentials.mongodb=false." -}}
{{- end -}}
{{- $redisLiteral := include "aries.suppliedEnvValue" (dict "root" . "name" "REDIS_PASSWORD") -}}
{{- if and .Values.redis.enabled .Values.redis.auth.enabled (not $suppliedURI) (ne (toString (default dict .Values.aries.injectBundledCredentials).redis) "false") $redisLiteral .Values.redis.auth.password (not .Values.redis.auth.existingSecret) (ne $redisLiteral (toString .Values.redis.auth.password)) -}}
{{- fail "REDIS_PASSWORD for Aries differs from redis.auth.password. Use the same value for both." -}}
{{- end -}}
{{- $mongoLiteral := include "aries.suppliedEnvValue" (dict "root" . "name" "MONGODB_ROOT_PASSWORD") -}}
{{- if and (include "aries.bundledMongoAuth" .) $mongoLiteral .Values.mongodb.auth.rootPassword (not .Values.mongodb.auth.existingSecret) (ne $mongoLiteral (toString .Values.mongodb.auth.rootPassword)) -}}
{{- fail "MONGODB_ROOT_PASSWORD for Aries differs from mongodb.auth.rootPassword. Use the same value for both." -}}
{{- end -}}
{{- end }}

{{/*
RAG Selector labels
*/}}
{{- define "rag.selectorLabels" -}}
app.kubernetes.io/name: {{ include "aries.fullname" . }}-rag
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "aries.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "aries.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Define apiVersion of HorizontalPodAutoscaler
*/}}
{{- define "aries.hpa.apiVersion" -}}
{{- if .Capabilities.APIVersions.Has "autoscaling/v2" -}}
{{- print "autoscaling/v2" -}}
{{- else if .Capabilities.APIVersions.Has "autoscaling/v2beta2" -}}
{{- print "autoscaling/v2beta2" -}}
{{- else -}}
{{- print "autoscaling/v2beta1" -}}
{{- end -}}
{{- end -}}
