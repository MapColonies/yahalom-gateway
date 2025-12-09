{{- define "yahalom-gateway.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{- define "yahalom-gateway.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "yahalom-gateway.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{- define "yahalom-gateway.labels" -}}
helm.sh/chart: {{ include "yahalom-gateway.chart" . }}
{{ include "yahalom-gateway.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{ include "mclabels.labels" . }}
{{- end -}}

{{- define "yahalom-gateway.selectorLabels" -}}
app.kubernetes.io/name: {{ include "yahalom-gateway.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{ include "mclabels.selectorLabels" . }}
{{- end -}}

{{- define "yahalom-gateway.tag" -}}
{{- if .Values.global.image.tag }}
    {{- .Values.global.image.tag -}}
{{- else if .Values.image.tag }}
    {{- .Values.image.tag -}}
{{- else -}}
    {{- printf "v%s" .Chart.AppVersion -}}
{{- end -}}
{{- end -}}

{{- define "yahalom-gateway.cloudProviderFlavor" -}}
{{- if .Values.global.cloudProvider.flavor }}
    {{- .Values.global.cloudProvider.flavor -}}
{{- else if .Values.cloudProvider.flavor }}
    {{- .Values.cloudProvider.flavor -}}
{{- else -}}
    minikube
{{- end -}}
{{- end -}}

{{- define "yahalom-gateway.cloudProviderDockerRegistryUrl" -}}
{{- $url := "" -}}
{{- if .Values.global.cloudProvider.dockerRegistryUrl }}
    {{- $url = .Values.global.cloudProvider.dockerRegistryUrl -}}
{{- else if .Values.cloudProvider.dockerRegistryUrl }}
    {{- $url = .Values.cloudProvider.dockerRegistryUrl -}}
{{- end -}}

{{- if $url }}
    {{- if not (hasSuffix $url "/") -}}
        {{- printf "%s/" $url -}}
    {{- else -}}
        {{- $url -}}
    {{- end -}}
{{- else -}}
    ""
{{- end -}}
{{- end -}}

{{- define "yahalom-gateway.cloudProviderImagePullSecretName" -}}
{{- if .Values.global.cloudProvider.imagePullSecretName }}
    {{- .Values.global.cloudProvider.imagePullSecretName -}}
{{- else if .Values.cloudProvider.imagePullSecretName }}
    {{- .Values.cloudProvider.imagePullSecretName -}}
{{- end -}}
{{- end -}}

{{- define "yahalom-gateway.tracingUrl" -}}
{{- if .Values.global.env.tracing.url }}
    {{- .Values.global.env.tracing.url -}}
{{- else if .Values.env.tracing.url }}
    {{- .Values.env.tracing.url -}}
{{- end -}}
{{- end -}}

{{- define "yahalom-gateway.metricsUrl" -}}
{{- if .Values.global.env.metrics.url }}
    {{- .Values.global.env.metrics.url -}}
{{- else if .Values.env.metrics.url }}
    {{- .Values.env.metrics.url -}}
{{- end -}}
{{- end -}}
